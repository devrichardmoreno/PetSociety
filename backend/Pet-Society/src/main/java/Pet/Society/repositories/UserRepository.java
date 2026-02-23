package Pet.Society.repositories;

import Pet.Society.models.entities.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByDni (String dni);
    Optional<UserEntity> findByEmail (String email);
    Optional<UserEntity> findByPhone (String phone);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE UserEntity u SET u.emailVerified = true WHERE u.id = :userId")
    int setEmailVerifiedTrue(@Param("userId") long userId);
}
