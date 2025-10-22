package Pet.Society.repositories;

import Pet.Society.models.entities.CredentialEntity;
import Pet.Society.models.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CredentialRepository extends JpaRepository<CredentialEntity, Long> {

    Optional<CredentialEntity> findByUsernameAndPassword(String username, String password);

    Optional<CredentialEntity> findByUsername(String username);

    List<CredentialEntity> findByRole(Role role);
}
