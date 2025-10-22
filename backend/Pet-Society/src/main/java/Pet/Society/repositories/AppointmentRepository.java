package Pet.Society.repositories;

import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.PetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Long> {

    List<AppointmentEntity> findAppointmentByStartDateAndEndDate(LocalDateTime startDate, LocalDateTime endDate);
    /*List<AppointmentEntity> x(DoctorEntity doctor);*/
    AppointmentEntity findByPetAndId(PetEntity pet, long id);
    AppointmentEntity findByIdAndPetId(long id, long petId);
    List<AppointmentEntity> findAllByPetClientId(Long clientId);
    List<AppointmentEntity> findAllByPetId(Long petId);
    List<AppointmentEntity> findAllByDoctorId(Long doctorId);
    List<AppointmentEntity> findAppointmentByDoctor(DoctorEntity doctor);
}
