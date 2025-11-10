package Pet.Society.services;

import Pet.Society.models.dto.diagnoses.DiagnosesDTO;
import Pet.Society.models.dto.diagnoses.DiagnosesDTOResponse;
import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.DiagnosesEntity;
import Pet.Society.models.enums.Status;
import Pet.Society.models.exceptions.*;
import Pet.Society.models.interfaces.Mapper;
import Pet.Society.repositories.AppointmentRepository;
import Pet.Society.repositories.DiagnosesRepository;
import Pet.Society.repositories.DoctorRepository;
import Pet.Society.repositories.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DiagnosesService implements Mapper<DiagnosesDTOResponse, DiagnosesEntity> {

    private final DiagnosesRepository diagnosesRepository;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public DiagnosesService(DiagnosesRepository diagnosesRepository,
                            PetRepository petRepository,
                            DoctorRepository doctorRepository,
                            AppointmentRepository appointmentRepository,
                            AppointmentService appointmentService) {
        this.diagnosesRepository = diagnosesRepository;
        this.appointmentRepository = appointmentRepository;

    }


    public DiagnosesDTOResponse save(DiagnosesDTO dto) {

        AppointmentEntity appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        if(appointment.getPet()==null){
            throw new AppointmentWithoutPetException("There is not pets in this appointment");
        }


        DiagnosesEntity diagnosis = DiagnosesEntity.builder()
                .diagnose(dto.getDiagnose())
                .treatment(dto.getTreatment())
                .doctor(appointment.getDoctor())
                .pet(appointment.getPet())
                .appointment(appointment)
                .date(LocalDateTime.now())
                .build();



        appointment.setStatus(Status.SUCCESSFULLY);
        appointment.setDiagnoses(diagnosis);
        this.diagnosesRepository.save(diagnosis);

        return toDTO(diagnosis);
    }

    public DiagnosesDTOResponse findById(Long id) {
        return toDTO(diagnosesRepository.findById(id)
                .orElseThrow(() -> new DiagnosesNotFoundException("Diagnosis " + id + " not found")));
    }


    public DiagnosesDTOResponse findLastById(long id) {
        if (diagnosesRepository.findLastById(id).isPresent()) {
            DiagnosesEntity diagnosis = diagnosesRepository.findLastById(id).get();
            return toDTO(diagnosis);
        } else {
            throw new DiagnosesNotFoundException("Diagnosis " + id + " not found");
        }
    }

    public Page<DiagnosesDTOResponse> findByPetClientId(long id, Pageable pageable) {
        Page<DiagnosesEntity> diagnoses = this.diagnosesRepository.findByPetClientId(id, pageable);
        if(diagnoses.isEmpty()){
            return Page.empty();
        }
        return diagnoses.map(this::toDTO);
    }

    public Page<DiagnosesDTOResponse> findByPetId(long id, Pageable pageable) {
        if (diagnosesRepository.findByPetId(id, pageable).isEmpty()) {
            throw new DiagnosesNotFoundException("Diagnoses of Pet id : " + id + " not found");
        }
        return diagnosesRepository.findByPetId(id, pageable).map(this::toDTO);

    }

    public Page<DiagnosesDTOResponse> findAll(Pageable pageable) {
        return diagnosesRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<DiagnosesDTOResponse> findByDoctorId(long id, Pageable pageable) {

        if (diagnosesRepository.findByDoctorId(id, pageable).isEmpty()) {
            throw new DiagnosesNotFoundException("Diagnoses of Doctor id : " + id + " not found");
        }
        return diagnosesRepository.findByDoctorId(id, pageable).map(this::toDTO);
    }

    @Override
    public DiagnosesEntity toEntity(DiagnosesDTOResponse dto) {
        return null;
    }

    @Override
    public DiagnosesDTOResponse toDTO(DiagnosesEntity entity) {
        return DiagnosesDTOResponse.builder()
                .diagnose(entity.getDiagnose())
                .treatment(entity.getTreatment())
                .doctorName(entity.getDoctor().getName() + " " + entity.getDoctor().getSurname())
                .petName(entity.getPet().getName())
                .appointmentReason(entity.getAppointment().getReason())
                .date(entity.getDate())
                .build();
    }


}
