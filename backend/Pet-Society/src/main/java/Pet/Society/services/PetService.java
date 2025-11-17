package Pet.Society.services;

import Pet.Society.models.dto.client.ClientDTO;
import Pet.Society.models.dto.pet.PetDTO;
import Pet.Society.models.entities.ClientEntity;
import Pet.Society.models.entities.PetEntity;
import Pet.Society.models.exceptions.NoPetsException;
import Pet.Society.models.exceptions.PetNotFoundException;
import Pet.Society.models.exceptions.TooManyPetsException;
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

        List<PetEntity> pets = petRepository.findAllByClientAndActiveTrue(client);
        if(pets.size()>4){
            throw new TooManyPetsException("The client can have a maximum of 5 active pets");
        }
        
        // Validar que petType no sea null
        if (dto.getPetType() == null) {
            throw new IllegalArgumentException("El tipo de animal (petType) es requerido");
        }
        
        // Validar que si petType es OTHER, otherType no sea null o vacío
        if (dto.getPetType() == Pet.Society.models.enums.PetType.OTHER) {
            if (dto.getOtherType() == null || dto.getOtherType().trim().isEmpty()) {
                throw new IllegalArgumentException("Si el tipo de animal es 'Otro', debe especificar el tipo de animal personalizado");
            }
        }
        
        PetEntity pet = new PetEntity();
        pet.setName(dto.getName());
        pet.setAge(dto.getAge());
        pet.setActive(dto.isActive());
        pet.setPetType(dto.getPetType());
        pet.setOtherType(dto.getPetType() == Pet.Society.models.enums.PetType.OTHER ? dto.getOtherType() : null);
        pet.setClient(client);
        petRepository.save(pet);

        return toDTO(pet);
    }


    //CORREGIR
    public PetDTO updatePet(Long id,PetDTO pet) {
        PetEntity existingPet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException("La mascota con ID: " + id + " no existe."));
        
        // Validar que si petType es OTHER, otherType no sea null o vacío
        if (pet.getPetType() == Pet.Society.models.enums.PetType.OTHER) {
            if (pet.getOtherType() == null || pet.getOtherType().trim().isEmpty()) {
                throw new IllegalArgumentException("Si el tipo de animal es 'Otro', debe especificar el tipo de animal personalizado");
            }
        }
        
        takeAttributes(toEntity(pet),existingPet);
        return toDTO(petRepository.save(existingPet));
    }

    public void deletePet(Long id) {
        PetEntity pet =petRepository.findById(id).orElseThrow(() -> new PetNotFoundException("The pet with " + id + " was not found."));
        pet.setActive(false);
        this.petRepository.save(pet);
    }

    @Transactional
    public void reactivatePet(Long id) {
        PetEntity pet = petRepository.findById(id)
                .orElseThrow(() -> new PetNotFoundException("The pet with " + id + " was not found."));
        
        ClientEntity client = pet.getClient();
        List<PetEntity> activePets = petRepository.findAllByClientAndActiveTrue(client);
        
        if(activePets.size() >= 5){
            throw new TooManyPetsException("The client can have a maximum of 5 active pets");
        }
        
        pet.setActive(true);
        this.petRepository.save(pet);
    }

    //WORKS BUT IT'S NEED ALWAYS THE clientID from petDTO
    public PetEntity takeAttributes(PetEntity origin, PetEntity detination){

        if (origin.getName() != null) {detination.setName(origin.getName());}
        if (origin.getAge() != 0) {detination.setAge(origin.getAge());}
        if (origin.getClient() == null){origin.setClient(detination.getClient());}
        if (origin.isActive() != detination.isActive()) {detination.setActive(origin.isActive());}
        if (origin.getPetType() != null) {
            detination.setPetType(origin.getPetType());
            // Si el tipo es OTHER, actualizar otherType; si no, limpiarlo
            if (origin.getPetType() == Pet.Society.models.enums.PetType.OTHER) {
                detination.setOtherType(origin.getOtherType());
            } else {
                detination.setOtherType(null);
            }
        }

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

        List<PetEntity> pets = petRepository.findAllByClientAndActiveTrue(client);

        if(pets.isEmpty()){
            throw new NoPetsException("The client " + client.getName() + "doesn't have pets");
        }

        return pets.stream().map(this::toDTO).toList();
    }

    public List<PetDTO> getAllPetsByClientIdIncludingInactive(Long clientId) {
        ClientEntity client = clientRepository.findById(clientId)
                .orElseThrow(() -> new UserNotFoundException("Client with id: " + clientId + " was not found."));

        List<PetEntity> pets = petRepository.findAllByClient(client);

        return pets.stream().map(this::toDTO).toList();
    }

    @Override
    public PetEntity toEntity(PetDTO dto) {
        PetEntity entity = PetEntity.builder()
                .name(dto.getName())
                .age(dto.getAge())
                .active(dto.isActive())
                .petType(dto.getPetType())
                .otherType(dto.getPetType() == Pet.Society.models.enums.PetType.OTHER ? dto.getOtherType() : null)
                .client(this.clientRepository.findById(dto.getClientId()).get())
                .build();
        return entity;
    }

    @Override
    public PetDTO toDTO(PetEntity entity) {
        return PetDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .age(entity.getAge())
                .active(entity.isActive())
                .petType(entity.getPetType())
                .otherType(entity.getOtherType())
                .clientId(entity.getClient().getId())
                .build();
    }
}
