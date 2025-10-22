package Pet.Society.repositories;

import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.DiagnosesEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface DiagnosesRepository extends JpaRepository<DiagnosesEntity, Long> {

    @Query(value = "SELECT d FROM DiagnosesEntity d WHERE d.pet.id = :id ORDER BY d.date DESC LIMIT 1")
    Optional<DiagnosesEntity> findLastById (@Param("id") Long id);

    @Query(value = "SELECT * FROM diagnoses_entity WHERE pet_pet_id = ?1",
            countQuery = "SELECT COUNT(*) FROM diagnoses_entity WHERE pet_pet_id = ?1",
            nativeQuery = true)
    Page<DiagnosesEntity> findByPetId(Long pet_id, Pageable pageable);

    @Query(value = "SELECT * FROM diagnoses_entity WHERE doctor_id = ?1",
    countQuery = "SELECT COUNT(*) FROM diagnoses_entity WHERE doctor_id = ?1",
    nativeQuery = true)
    Page<DiagnosesEntity> findByDoctorId(Long doctor_id, Pageable pageable);

    @Query("SELECT d FROM DiagnosesEntity d WHERE d.appointment = :appointment")
    Optional<DiagnosesEntity> findByAppointment(@Param("appointment") AppointmentEntity appointment);

    Page<DiagnosesEntity> findByPetClientId(long petClientId, Pageable pageable);
}
