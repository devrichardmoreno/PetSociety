package Pet.Society.repositories;

import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<DoctorEntity, Long> {
    Optional<DoctorEntity> findByDni (String Dni);
}
