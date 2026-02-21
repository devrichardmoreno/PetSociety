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
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
public class DiagnosesService implements Mapper<DiagnosesDTOResponse, DiagnosesEntity> {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

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

    /**
     * Obtiene la fecha y hora actual en la zona horaria de Argentina
     * @return LocalDateTime con la hora actual de Argentina
     */
    private LocalDateTime getCurrentDateTimeArgentina() {
        return ZonedDateTime.now(ARGENTINA_ZONE).toLocalDateTime();
    }


    public DiagnosesDTOResponse save(DiagnosesDTO dto) {

        AppointmentEntity appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        if(appointment.getPet()==null){
            throw new AppointmentWithoutPetException("There is not pets in this appointment");
        }

        // Validar que el diagnóstico se pueda crear hasta 1 hora después de que termine la cita
        // Usar la misma zona horaria que AppointmentService (Argentina)
        LocalDateTime now = getCurrentDateTimeArgentina();
        LocalDateTime appointmentStartTime = appointment.getStartDate();
        LocalDateTime appointmentEndTime = appointment.getEndDate();
        LocalDateTime maxAllowedTime = appointmentEndTime.plusHours(1);

        // No se puede crear antes de que comience la cita
        if (now.isBefore(appointmentStartTime)) {
            throw new BeforeAppointmentException("No se puede crear un diagnóstico antes de que comience la cita.");
        }

        // Se puede crear hasta 1 hora después de que termine la cita (inclusive)
        // Usamos isAfter con exclusión estricta, por lo que si now es igual a maxAllowedTime, aún se permite
        if (now.isAfter(maxAllowedTime)) {
            throw new BeforeAppointmentException("No se puede crear un diagnóstico después de 1 hora de haber terminado la cita.");
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
                .petType(entity.getPet().getPetType())
                .otherType(entity.getPet().getOtherType())
                .appointmentReason(entity.getAppointment().getReason())
                .date(entity.getDate())
                .build();
    }


}
