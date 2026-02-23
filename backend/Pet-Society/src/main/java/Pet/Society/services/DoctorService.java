package Pet.Society.services;

import Pet.Society.models.dto.doctor.DoctorDTO;
import Pet.Society.models.dto.doctor.DoctorRequest;
import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.enums.Status;
import Pet.Society.models.exceptions.UserExistsException;
import Pet.Society.models.exceptions.UserNotFoundException;
import Pet.Society.models.interfaces.Mapper;
import Pet.Society.repositories.AppointmentRepository;
import Pet.Society.repositories.DoctorRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
@Service
public class DoctorService implements Mapper<DoctorDTO, DoctorEntity> {


    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public DoctorService(DoctorRepository doctorRepository, AppointmentRepository appointmentRepository) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public DoctorEntity saveEntity(DoctorEntity doctorEntity) {
        if(doctorExistByDni(doctorEntity.getDni())){
            throw new UserExistsException("The doctor already exists");
        }
        return doctorRepository.save(doctorEntity);
    }

    public DoctorEntity save(DoctorDTO doctor) {
        if(doctorExistByDni(doctor.getDni())){
            throw new UserExistsException("The doctor already exists");
        }
        DoctorEntity saveDoctor = this.doctorRepository.save(toEntity(doctor)); //receives a Doctor Entity
        return toEntity(doctor);
    }

    public DoctorEntity findById1(Long id){
        Optional<DoctorEntity> doctor = this.doctorRepository.findById(id);
        if (doctor.isEmpty()){
            throw new UserNotFoundException("Doctor not found");
        }
        return doctor.get();
    }

    public DoctorDTO findById(Long id) {
        Optional<DoctorEntity> doctor = this.doctorRepository.findById(id);
        if (doctor.isEmpty()){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found");
        }
        return toDTO(doctor.get());
    }


    public boolean doctorExistById(Long id) {
        Optional<DoctorEntity> existing = doctorRepository.findById(id);
        return existing.isPresent();
    }

    public DoctorDTO findByDni(String dni) {
        Optional<DoctorEntity> doctor = this.doctorRepository.findByDni(dni);
        if (doctor.isEmpty()){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found");
        }
        return toDTO(doctor.get());
    }

    public DoctorDTO update(DoctorDTO doctorToModify, Long id) {
        Optional<DoctorEntity> existingDoctor = this.doctorRepository.findById(id);
        if (existingDoctor.isEmpty()){
            throw new UserNotFoundException("Doctor does not exist");
        }
       takeAttributes(toEntity(doctorToModify), existingDoctor.get());

        this.doctorRepository.save(existingDoctor.get());
        return toDTO(existingDoctor.get());
    }

    public DoctorEntity takeAttributes(DoctorEntity doctorToModify, DoctorEntity existingDoctor) {
        if(doctorToModify.getName() != null) existingDoctor.setName(doctorToModify.getName());
        if(doctorToModify.getSurname() != null) existingDoctor.setSurname(doctorToModify.getSurname());
        if(doctorToModify.getEmail() != null) existingDoctor.setEmail(doctorToModify.getEmail());
        if(doctorToModify.getPhone() != null) existingDoctor.setPhone(doctorToModify.getPhone());
        if(doctorToModify.getDni() != null) existingDoctor.setDni(doctorToModify.getDni());
        if(doctorToModify.getSpeciality() != null) existingDoctor.setSpeciality(doctorToModify.getSpeciality());

        return existingDoctor;
    }

    @Transactional
    public void unSubscribe(Long id){
        Optional<DoctorEntity> existingDoctor = this.doctorRepository.findById(id);
        if (existingDoctor.isEmpty()){
            throw new UserNotFoundException("Doctor does not exist");
        }
        DoctorEntity doctorToUnsubscribe = existingDoctor.get();
        
        // Obtener todas las citas futuras del doctor
        LocalDateTime now = LocalDateTime.now();
        List<AppointmentEntity> futureAppointments = appointmentRepository.findAllByDoctorId(id)
                .stream()
                .filter(appointment -> {
                    // Solo citas futuras que no estén canceladas ni completadas
                    LocalDateTime startDate = appointment.getStartDate();
                    return startDate.isAfter(now) && 
                           appointment.getStatus() != Status.CANCELED && 
                           appointment.getStatus() != Status.SUCCESSFULLY;
                })
                .collect(Collectors.toList());
        
        // Cancelar todas las citas futuras del doctor
        // Las citas pasadas se mantienen para el registro histórico
        for (AppointmentEntity appointment : futureAppointments) {
            appointment.setStatus(Status.CANCELED);
            appointmentRepository.save(appointment);
        }
        
        // Finalmente, marcar al doctor como dado de baja
        doctorToUnsubscribe.setSubscribed(false);
        this.doctorRepository.save(doctorToUnsubscribe);
    }

    public void reSubscribe(Long id){
        Optional<DoctorEntity> existingDoctor = this.doctorRepository.findById(id);
        if (existingDoctor.isEmpty()){
            throw new UserNotFoundException("Doctor does not exist");
        }
        DoctorEntity doctorToResubscribe = existingDoctor.get();
        doctorToResubscribe.setSubscribed(true);
        this.doctorRepository.save(doctorToResubscribe);
    }

    public boolean doctorExistByDni(String dni){
        Optional<DoctorEntity> existing = doctorRepository.findByDni(dni);
        if(existing.isEmpty())
            return false;
        return true;
    }


    public Page<DoctorDTO> getAllDoctors(Pageable pageable) {
        Page<DoctorEntity> doctors = this.doctorRepository.findAll(pageable);
        return doctors.map(this::toDTO);
    }

    public List<DoctorEntity> getAllDoctorsEntity(){
        return this.doctorRepository.findBySubscribedTrue();
    }

    public List<DoctorEntity> getAllInactiveDoctorsEntity(){
        return this.doctorRepository.findBySubscribedFalse();
    }


    @Override
    public DoctorEntity toEntity(DoctorDTO dto) {
        return DoctorEntity.builder()
                .name(dto.getName())
                .surname(dto.getSurname())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .dni(dto.getDni())
                .speciality(dto.getSpeciality())
                .build();
    }

    @Override
    public DoctorDTO toDTO(DoctorEntity entity) {
        return DoctorDTO.builder()
                .name(entity.getName())
                .surname(entity.getSurname())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .dni(entity.getDni())
                .speciality(entity.getSpeciality())
                .build();
    }
}
