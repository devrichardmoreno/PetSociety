package Pet.Society.services;

import Pet.Society.models.dto.client.ClientDTO;
import Pet.Society.models.dto.pet.PetDTO;
import Pet.Society.models.entities.ClientEntity;
import Pet.Society.models.entities.PetEntity;
import Pet.Society.models.exceptions.NoPetsException;
import Pet.Society.models.exceptions.PetNotFoundException;
import Pet.Society.models.exceptions.UserNotFoundException;
import Pet.Society.models.interfaces.Mapper;
import Pet.Society.repositories.ClientRepository;
import Pet.Society.repositories.PetRepository;
import com.github.javafaker.Faker;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Optional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;


@Service
public class PetService implements Mapper<PetDTO, PetEntity> {

    private final PetRepository petRepository;
    private final ClientRepository clientRepository;

    @Autowired
    public PetService(PetRepository petRepository, ClientRepository clientRepository) {
        this.petRepository = petRepository;
        this.clientRepository = clientRepository;
    }


    @Transactional
    public PetDTO createPet(PetDTO dto) {
        ClientEntity client = clientRepository.findById(dto.getClientId())
                .orElseThrow(() -> new UserNotFoundException("Cliente with ID " + dto.getClientId() + " not found."));

        List<PetEntity> pets = petRepository.findAllByClient(client);
        if(pets.size()>4){
            throw new PetNotFoundException("The client can have 5 pets");
        }
        PetEntity pet = new PetEntity();
        pet.setName(dto.getName());
        pet.setAge(dto.getAge());
        pet.setActive(dto.isActive());
        pet.setClient(client);
        petRepository.save(pet);

        return dto;
    }


    //CORREGIR
    public PetDTO updatePet(Long id,PetDTO pet) {
        PetEntity existingPet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException("La mascota con ID: " + id + " no existe."));
                takeAttributes(toEntity(pet),existingPet);
                return toDTO(petRepository.save(existingPet));
    }

    public void deletePet(Long id) {
        PetEntity pet =petRepository.findById(id).orElseThrow(() -> new PetNotFoundException("The pet with " + id + " was not found."));
        pet.setActive(false);
        this.petRepository.save(pet);
    }

    //WORKS BUT IT'S NEED ALWAYS THE clientID from petDTO
    public PetEntity takeAttributes(PetEntity origin, PetEntity detination){

        if (origin.getName() != null) {detination.setName(origin.getName());}
        if (origin.getAge() != 0) {detination.setAge(origin.getAge());}
        if (origin.getClient() == null){origin.setClient(detination.getClient());}
        if (origin.isActive() != detination.isActive()) {detination.setActive(origin.isActive());}

        return detination;
    }

    public PetDTO getPetById(Long id) {
        return toDTO(petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException("the pet doesn't exist with ID: " + id)));
    }

    public PetEntity findById(Long id) {
        return this.petRepository.findById(id).orElseThrow(() -> new PetNotFoundException("the pet doesn't exist with ID: " + id));
    }

    public Optional<ClientDTO> getOwnerByPetId(Long id) {
        PetEntity pet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException("The pet doesn't exist with ID: " + id));
        return Optional.ofNullable(ClientDTO.builder().dni(pet.getClient().getName())
                .surname(pet.getClient().getSurname())
                .phone(pet.getClient().getPhone())
                .dni(pet.getClient().getDni())
                .email(pet.getClient().getEmail())
                .build());
    }

    public boolean existsPetById(Long id) {
        return petRepository.existsById(id);
    }

    public Page<PetDTO> getAllPets(Pageable pageable) {
        Page<PetEntity> pets = this.petRepository.findAll(pageable);
        if(pets.isEmpty()){
            throw new PetNotFoundException("Theres no pets found");
        }
        return pets.map(this::toDTO);
    }

    public List<PetDTO> seeMyPets(String dni){
      List<PetDTO> pets = this.petRepository.findAllByClient_Dni(dni).stream().map(this::toDTO).toList();
      if(pets.isEmpty()){
          throw new NoPetsException("Theres no pets found");
      }
      return pets;
    }

    public List<PetDTO> getAllPetsByClientId(Long clientId) {
        ClientEntity client = clientRepository.findById(clientId)
                .orElseThrow(() -> new UserNotFoundException("Client with id: " + clientId + " was not found."));

        List<PetEntity> pets = petRepository.findAllByClient(client);

        if(pets.isEmpty()){
            throw new NoPetsException("The client " + client.getName() + "doesn't have pets");
        }

        return pets.stream().map(this::toDTO).toList();
    }

    @Override
    public PetEntity toEntity(PetDTO dto) {
        return PetEntity.builder()
                .name(dto.getName())
                .age(dto.getAge())
                .active(dto.isActive())
                .client(this.clientRepository.findById(dto.getClientId()).get())
                .build();
    }

    @Override
    public PetDTO toDTO(PetEntity entity) {
        return PetDTO.builder()
                .name(entity.getName())
                .age(entity.getAge())
                .active(entity.isActive())
                .clientId(entity.getClient().getId())
                .build();
    }
}
