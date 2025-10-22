package Pet.Society.repositories;

import Pet.Society.models.dto.pet.PetDTO;
import Pet.Society.models.entities.ClientEntity;
import Pet.Society.models.entities.PetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<PetEntity, Long> {

    List<PetEntity> findAllByClient(ClientEntity client);

    List<PetEntity> findAllByClient_Dni(String clientDni);
}
