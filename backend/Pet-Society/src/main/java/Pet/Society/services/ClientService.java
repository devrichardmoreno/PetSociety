package Pet.Society.services;


import Pet.Society.models.dto.client.ClientDTO;
import Pet.Society.models.dto.client.ClientListDTO;
import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.ClientEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.enums.Reason;
import Pet.Society.models.enums.Status;
import Pet.Society.models.exceptions.UserExistsException;
import Pet.Society.models.exceptions.UserNotFoundException;
import Pet.Society.models.interfaces.Mapper;
import Pet.Society.repositories.AppointmentRepository;
import Pet.Society.repositories.ClientRepository;
import Pet.Society.repositories.PetRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ClientService implements Mapper <ClientDTO, ClientEntity> {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private final ClientRepository clientRepository;
    private final PetRepository petRepository;
    private final AppointmentRepository appointmentRepository;

    @Autowired
    public ClientService(ClientRepository clientRepository, PetRepository petRepository, AppointmentRepository appointmentRepository) {
        this.clientRepository = clientRepository;
        this.petRepository = petRepository;
        this.appointmentRepository = appointmentRepository;
    }

    private LocalDateTime getCurrentDateTimeArgentina() {
        return ZonedDateTime.now(ARGENTINA_ZONE).toLocalDateTime();
    }

    public ClientEntity save(ClientDTO clientDTO) {
        Optional<ClientEntity> clientEntity= this.clientRepository.findByDni(clientDTO.getDni());
          if(clientEntity.isPresent()) {
              throw new UserExistsException("User already exists");
          }
        ClientEntity clientToSave = toEntity(clientDTO);

          return this.clientRepository.save(clientToSave);
    }

    public ClientEntity saveWithFoundation(ClientDTO clientDTO, Boolean foundation) {
        Optional<ClientEntity> clientEntity= this.clientRepository.findByDni(clientDTO.getDni());
          if(clientEntity.isPresent()) {
              throw new UserExistsException("User already exists");
          }
        ClientEntity clientToSave = toEntity(clientDTO);
        clientToSave.setFoundation(foundation != null ? foundation : false);

          return this.clientRepository.save(clientToSave);
    }

    public ClientDTO findById(long id) {
       ClientEntity client= this.clientRepository.findById(id).stream()
               .findFirst().orElseThrow(() -> new UserNotFoundException("Client not found"));
       return toDTO(client);
    }

    //SOLO RECIBE UN JSON COMPLETO.
    public ClientDTO update(ClientDTO clientToModify, Long id) {
        Optional<ClientEntity> existingClient = this.clientRepository.findById(id);
        if (existingClient.isEmpty()){
            throw new UserNotFoundException("User does not exist");
        }
        ClientEntity clientToUpdate = toEntity(clientToModify);
        clientToUpdate.setId(id);
        takeAttributes(clientToUpdate, existingClient.get());
        this.clientRepository.save(clientToUpdate);
        return clientToModify;
    }

    @Transactional
    public void unSubscribe(Long id){
        Optional<ClientEntity> existingClient = this.clientRepository.findById(id);
        if (existingClient.isEmpty()){
            throw new UserNotFoundException("User does not exist");
        }
        ClientEntity clientToUnsubscribe = existingClient.get();
        
        // Obtener todas las citas futuras del cliente (a través de sus mascotas)
        LocalDateTime now = getCurrentDateTimeArgentina();
        List<AppointmentEntity> futureAppointments = appointmentRepository.findAllByPetClientId(id)
                .stream()
                .filter(appointment -> {
                    // Solo citas futuras que no estén canceladas ni completadas
                    LocalDateTime startDate = appointment.getStartDate();
                    return startDate.isAfter(now) && 
                           appointment.getStatus() != Status.CANCELED && 
                           appointment.getStatus() != Status.SUCCESSFULLY;
                })
                .collect(Collectors.toList());
        
        // Procesar cada cita futura
        for (AppointmentEntity appointment : futureAppointments) {
            // Guardar referencia a los datos de la cita antes de modificarla
            DoctorEntity doctor = appointment.getDoctor();
            LocalDateTime startDate = appointment.getStartDate();
            LocalDateTime endDate = appointment.getEndDate();
            Reason reason = appointment.getReason();
            
            // Marcar la cita original como cancelada
            appointment.setStatus(Status.CANCELED);
            appointmentRepository.save(appointment);
            
            // Calcular las horas hasta la cita
            long hoursUntilAppointment = Duration.between(now, startDate).toHours();
            
            // Solo crear una nueva cita disponible si se cancela con más de 24 horas de anticipación
            if (hoursUntilAppointment >= 24) {
                AppointmentEntity newAvailableAppointment = AppointmentEntity.builder()
                        .startDate(startDate)
                        .endDate(endDate)
                        .reason(reason)
                        .status(Status.AVAILABLE)
                        .doctor(doctor)
                        .pet(null) // Sin mascota asignada
                        .approved(false)
                        .build();
                
                // Verificar que no haya solapamiento antes de crear la nueva cita
                // (evitar duplicados si ya existe una cita disponible en ese horario)
                boolean hasOverlap = appointmentRepository.findAppointmentByStartDateAndEndDate(startDate, endDate)
                        .stream()
                        .anyMatch(existing -> 
                            existing.getDoctor().getId() == doctor.getId() &&
                            existing.getStatus() == Status.AVAILABLE &&
                            existing.getId() != appointment.getId()
                        );
                
                if (!hasOverlap) {
                    appointmentRepository.save(newAvailableAppointment);
                }
            }
            // Si hay menos de 24 horas, solo se cancela la cita sin crear una nueva disponible
        }
        
        // Finalmente, marcar al cliente como dado de baja
        clientToUnsubscribe.setSubscribed(false);
        this.clientRepository.save(clientToUnsubscribe);
    }

    public void reSubscribe(Long id){
        Optional<ClientEntity> existingClient = this.clientRepository.findById(id);
        if (existingClient.isEmpty()){
            throw new UserNotFoundException("User does not exist");
        }
        ClientEntity clientToResubscribe = existingClient.get();
        clientToResubscribe.setSubscribed(true);
        this.clientRepository.save(clientToResubscribe);
    }

    public ClientDTO findByDNI(String DNI){
        return toDTO(this.clientRepository.findByDni(DNI).orElseThrow(()-> new UserExistsException("User does not exist")));
    }

    public ClientDTO takeAttributes(ClientEntity origin, ClientEntity destination) {
        if(origin.getName() == null){origin.setName(destination.getName());}
        if(origin.getSurname() == null){origin.setSurname(destination.getSurname());}
        if(origin.getEmail() == null){origin.setEmail(destination.getEmail());}
        if(origin.getDni() == null){origin.setDni(destination.getDni());}
        if(origin.getPhone()==null){origin.setPhone(destination.getPhone());}

        return toDTO(destination);
    }

    public Page<ClientDTO> getAllClients(Pageable pageable) {
        Page<ClientEntity> clients = this.clientRepository.findAll(pageable);
        if(!clients.hasContent()){
            return Page.empty();
        }

        return clients.map(clientEntity
                -> ClientDTO.builder().name(clientEntity.getName())
                                     .surname(clientEntity.getSurname())
                                     .phone(clientEntity.getPhone())
                                     .dni(clientEntity.getDni())
                                     .email(clientEntity.getEmail())
                                     .build());

    }

    public List<ClientEntity> getAllClientsEntity(){
        return this.clientRepository.findAll();
    }

    public List<ClientListDTO> getAllActiveClientsWithPetsCount(){
        List<ClientEntity> activeClients = this.clientRepository.findBySubscribedTrue();
        return activeClients.stream().map(client -> {
            int petsCount = petRepository.findAllByClientAndActiveTrue(client).size();
            return ClientListDTO.builder()
                    .id(client.getId())
                    .name(client.getName())
                    .surname(client.getSurname())
                    .dni(client.getDni())
                    .phone(client.getPhone())
                    .email(client.getEmail())
                    .petsCount(petsCount)
                    .build();
        }).collect(Collectors.toList());
    }

    public List<ClientListDTO> getAllInactiveClientsWithPetsCount(){
        List<ClientEntity> inactiveClients = this.clientRepository.findBySubscribedFalse();
        return inactiveClients.stream().map(client -> {
            int petsCount = petRepository.findAllByClientAndActiveTrue(client).size();
            return ClientListDTO.builder()
                    .id(client.getId())
                    .name(client.getName())
                    .surname(client.getSurname())
                    .dni(client.getDni())
                    .phone(client.getPhone())
                    .email(client.getEmail())
                    .petsCount(petsCount)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public ClientEntity toEntity(ClientDTO dto) {
        return ClientEntity.builder()
                .name(dto.getName())
                .surname(dto.getSurname())
                .dni(dto.getDni())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .subscribed(true)
                .build();
    }

    @Override
    public ClientDTO toDTO(ClientEntity entity) {
        return ClientDTO.builder().
                name(entity.getName()).
                surname(entity.getSurname())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .dni(entity.getDni())
                .build();
    }
}

