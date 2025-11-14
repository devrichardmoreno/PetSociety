package Pet.Society.repositories;

import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.PetEntity;
import Pet.Society.models.enums.Reason;
import Pet.Society.models.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    @Query(value = "SELECT * FROM appointments WHERE doctor_id = ?1 AND end_date > ?2 ORDER BY start_date ASC",
            countQuery = "SELECT COUNT(*) FROM appointments WHERE doctor_id = ?1 AND end_date > ?2",
            nativeQuery = true)
    Page<AppointmentEntity> findAllByDoctorIdOrderByStartDateAsc(Long doctorId, LocalDateTime now, Pageable pageable);
    List<AppointmentEntity> findAppointmentByDoctor(DoctorEntity doctor);
    
    // Métodos para obtener citas disponibles filtradas
    List<AppointmentEntity> findAllByReasonAndStatusAndPetIsNullAndStartDateAfter(
        Reason reason, Status status, LocalDateTime startDate);
    
    List<AppointmentEntity> findAllByReasonAndStatusAndPetIsNullAndStartDateBetween(
        Reason reason, Status status, LocalDateTime startDate, LocalDateTime endDate);
    
    @Modifying
    @Query("UPDATE AppointmentEntity a SET a.approved = :approved WHERE a.id = :id")
    void updateApprovedStatus(@Param("id") Long id, @Param("approved") boolean approved);
    
    @Query("SELECT a FROM AppointmentEntity a LEFT JOIN FETCH a.diagnoses LEFT JOIN FETCH a.pet p LEFT JOIN FETCH p.client WHERE a.id = :id")
    Optional<AppointmentEntity> findByIdWithDiagnoses(@Param("id") Long id);
}
