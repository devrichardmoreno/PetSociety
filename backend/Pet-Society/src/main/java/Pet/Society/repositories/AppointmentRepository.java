package Pet.Society.repositories;

import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.PetEntity;
import Pet.Society.models.enums.Reason;
import Pet.Society.models.enums.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Long> {

    List<AppointmentEntity> findAppointmentByStartDateAndEndDate(LocalDateTime startDate, LocalDateTime endDate);
    AppointmentEntity findByPetAndId(PetEntity pet, long id);
    AppointmentEntity findByIdAndPetId(long id, long petId);
    List<AppointmentEntity> findAllByPetClientId(Long clientId);
    List<AppointmentEntity> findAllByPetId(Long petId);
    List<AppointmentEntity> findAllByDoctorId(Long doctorId);
    List<AppointmentEntity> findAllByDoctorIdOrderByStartDateAsc(Long doctorId);
    List<AppointmentEntity> findAppointmentByDoctor(DoctorEntity doctor);
    
    // Métodos para obtener citas disponibles filtradas
    List<AppointmentEntity> findAllByReasonAndStatusAndPetIsNullAndStartDateAfter(
        Reason reason, Status status, LocalDateTime startDate);
    
    List<AppointmentEntity> findAllByReasonAndStatusAndPetIsNullAndStartDateBetween(
        Reason reason, Status status, LocalDateTime startDate, LocalDateTime endDate);
}
