package Pet.Society.services;

import Pet.Society.models.dto.appointment.AppointmentDTO;
import Pet.Society.models.dto.appointment.AppointmentResponseDTO;
import Pet.Society.models.dto.appointment.AppointmentScheduleDTO;
import Pet.Society.models.dto.appointment.AppointmentUpdateDTO;
import Pet.Society.models.dto.appointment.AvailableAppointmentDTO;
import Pet.Society.models.dto.client.ClientDTO;
import Pet.Society.models.dto.doctor.DoctorAvailabilityDTO;
import Pet.Society.models.dto.pet.AssingmentPetDTO;
import Pet.Society.models.dto.pet.PetDTO;
import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.ClientEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.PetEntity;
import Pet.Society.models.enums.Reason;
import Pet.Society.models.dto.appointment.AppointmentDTORequest;
import Pet.Society.models.enums.Status;
import Pet.Society.models.exceptions.AppointmentDoesntExistException;
import Pet.Society.models.exceptions.DuplicatedAppointmentException;
import Pet.Society.models.exceptions.UnavailableAppointmentException;
import Pet.Society.models.interfaces.Mapper;
import Pet.Society.repositories.AppointmentRepository;
import jakarta.transaction.Transactional;
import org.aspectj.weaver.patterns.ThisOrTargetAnnotationPointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cglib.core.Local;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.DoubleStream;


@Service
public class AppointmentService implements Mapper<AppointmentDTO,AppointmentEntity> {

    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final PetService petService;
    private final ClientService clientService;
    private final HttpMessageConverters messageConverters;


    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository, DoctorService doctorService, PetService petService, ClientService clientService, HttpMessageConverters messageConverters) {
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.petService = petService;
        this.clientService = clientService;
        this.messageConverters = messageConverters;
    }


    //MAYBE IS THE CORRECT WAY.
    //Si ya existe la cita; Excepcion
    //Si existe una cita que se solape con otra; Excepción

    @Transactional(rollbackOn = DuplicatedAppointmentException.class)
    public AppointmentDTO save (AppointmentDTORequest appointmentDTO) {

        DoctorEntity findDoctor = this.doctorService.findById1(appointmentDTO.getDoctor());

        AppointmentEntity appointment = AppointmentEntity.builder()
                                        .startDate(appointmentDTO.getStartTime())
                                        .endDate(appointmentDTO.getEndTime())
                                        .reason(appointmentDTO.getReason())
                                        .status(Status.AVAILABLE)
                                        .doctor(findDoctor)
                                        .approved(true)
                                        .build();
        if (isOverlapping(appointment)) {
            throw new DuplicatedAppointmentException("The appointment already exists; it has the same hour.");
        }
        this.appointmentRepository.save(appointment);
        return toDTO(appointment);
    }

    @Transactional
    public AppointmentResponseDTO bookAppointment(Long idAppointment, AssingmentPetDTO dto) {
        AppointmentEntity findAppointment = this.appointmentRepository.
                findById(idAppointment).orElseThrow(() -> new AppointmentDoesntExistException("Appointment not found"));

        if (findAppointment.getPet() != null) {
            throw new UnavailableAppointmentException("This appointment is already booked");
        }
        if(!findAppointment.isApproved()) {
            throw new UnavailableAppointmentException("The client has an unpaid appointment");
        }

        Optional<PetEntity> findPet =Optional.ofNullable(this.petService.findById(dto.getPetId())) ;

        // Validar que la mascota no tenga ya una cita programada (TO_BEGIN)
        List<AppointmentEntity> existingAppointments = this.appointmentRepository.findAllByPetId(dto.getPetId());
        boolean hasScheduledAppointment = existingAppointments.stream()
                .anyMatch(apt -> apt.getStatus().equals(Status.TO_BEGIN) && 
                               apt.getStartDate().isAfter(LocalDateTime.now()));
        
        if (hasScheduledAppointment) {
            throw new UnavailableAppointmentException("Esta mascota ya tiene una cita programada");
        }

        findAppointment.setPet(findPet.get());
        findAppointment.setStatus(Status.TO_BEGIN);
        this.appointmentRepository.save(findAppointment);


        return AppointmentResponseDTO.builder()
                .startTime(findAppointment.getStartDate())
                .endTime(findAppointment.getEndDate())
                .reason(findAppointment.getReason())
                .doctorName(findAppointment.getDoctor().getName() +" " + findAppointment.getDoctor().getSurname())
                .petName(findPet.get().getName())
                .aproved(findAppointment.isApproved())
                .status(findAppointment.getStatus())
                .build();
    }

    //Confirm if an Appointment doesn't overlap with another Appointment
   /// return if exist any match with another appointment in our database.
    private boolean isOverlapping(AppointmentEntity newAppointment) {

        return appointmentRepository.findAppointmentByDoctor(newAppointment.getDoctor())
                .stream()
                .anyMatch(existing ->
                        newAppointment.getStartDate().isBefore(existing.getEndDate()) &&
                                newAppointment.getEndDate().isAfter(existing.getStartDate())
                );
    }

    /**
     * Verifica si una cita se solapa con otras, excluyendo una cita específica (útil al cancelar)
     */
    private boolean isOverlappingExcludingAppointment(AppointmentEntity newAppointment, Long excludeAppointmentId) {
        return appointmentRepository.findAppointmentByDoctor(newAppointment.getDoctor())
                .stream()
                .filter(existing -> !Objects.equals(existing.getId(), excludeAppointmentId))
                .anyMatch(existing ->
                        newAppointment.getStartDate().isBefore(existing.getEndDate()) &&
                                newAppointment.getEndDate().isAfter(existing.getStartDate())
                );
    }

    ///WORKS
    public AppointmentDTO updateAppointment(AppointmentDTO appointmentUpdateDTO, long id) {
        Optional<AppointmentEntity> existingAppointment = this.appointmentRepository.findById(id);
        if (existingAppointment.isEmpty()) {
            throw new AppointmentDoesntExistException("Appointment does not exist");
        }
        AppointmentEntity appointmentToUpdate =  existingAppointment.get();
        if (appointmentUpdateDTO.getAproved() != null) {
            appointmentToUpdate.setApproved(appointmentUpdateDTO.getAproved());
        }

        if (appointmentUpdateDTO.getReason() != null) {
            appointmentToUpdate.setReason(appointmentUpdateDTO.getReason());
        }

        if (appointmentUpdateDTO.getStatus() != null) {
            appointmentToUpdate.setStatus(appointmentUpdateDTO.getStatus());
        }

        appointmentToUpdate.setPet(appointmentToUpdate.getPet());

            this.appointmentRepository.save(appointmentToUpdate);
        return toDTO(appointmentToUpdate);
    }



    @Transactional
    public void cancelAppointment(long id) {
        Optional<AppointmentEntity> existingAppointment = this.appointmentRepository.findById(id);

        if (existingAppointment.isEmpty()) {
            throw new AppointmentDoesntExistException("Appointment does not exist");
        }

        AppointmentEntity appointment = existingAppointment.get();
        LocalDateTime now = LocalDateTime.now();
        long hoursUntilAppointment = Duration.between(now, appointment.getStartDate()).toHours();

        // Marcar la cita como cancelada
        appointment.setStatus(Status.CANCELED);
        appointment.setPet(null);
        this.appointmentRepository.save(appointment);

        // Si se cancela con más de 24 horas de anticipación, crear una nueva cita disponible
        if (hoursUntilAppointment > 24) {
            AppointmentEntity newAvailableAppointment = AppointmentEntity.builder()
                    .startDate(appointment.getStartDate())
                    .endDate(appointment.getEndDate())
                    .reason(appointment.getReason())
                    .doctor(appointment.getDoctor())
                    .status(Status.AVAILABLE)
                    .approved(appointment.isApproved())
                    .pet(null)
                    .build();

            // Verificar que no se solape con otra cita existente (excluyendo la que acabamos de cancelar)
            if (!isOverlappingExcludingAppointment(newAvailableAppointment, appointment.getId())) {
                this.appointmentRepository.save(newAvailableAppointment);
            }
        }
    }

    /**
     * Obtiene el ID de la cita programada (TO_BEGIN) de una mascota
     * Útil para cancelar citas desde el frontend
     */
    public Long getScheduledAppointmentIdByPetId(long petId) {
        List<AppointmentEntity> appointments = this.appointmentRepository.findAllByPetId(petId);
        LocalDateTime now = LocalDateTime.now();
        
        Optional<AppointmentEntity> scheduledAppointment = appointments.stream()
                .filter(apt -> apt.getStatus().equals(Status.TO_BEGIN) && 
                             apt.getStartDate().isAfter(now))
                .min((a, b) -> a.getStartDate().compareTo(b.getStartDate()));
        
        return scheduledAppointment.map(AppointmentEntity::getId).orElse(null);
    }

    public AppointmentEntity getEntity(Long id) {
        return this.appointmentRepository.findById(id).orElseThrow(() -> new AppointmentDoesntExistException("Appointment does not exist"));
    }

    public AppointmentResponseDTO getAppointment(long id) {
        Optional<AppointmentEntity> existingAppointment = this.appointmentRepository.findById(id);
        if (existingAppointment.isEmpty()) {
            throw new AppointmentDoesntExistException("Appointment does not exist");
        }
        //This variable is for put in the pet name. For some reason, the method fails if there are not a Pet in the Appointment
        String message = existingAppointment.get().getPet() == null ? "No hay mascota asignada" : existingAppointment.get().getPet().getName();
        return AppointmentResponseDTO.builder()
                .startTime(existingAppointment.get().getStartDate())
                .endTime(existingAppointment.get().getEndDate())
                .reason(existingAppointment.get().getReason())
                .doctorName(existingAppointment.get().getDoctor().getName()+ " " +existingAppointment.get().getDoctor().getSurname())
                .aproved(existingAppointment.get().isApproved())
                .status(existingAppointment.get().getStatus())
                .petName(message)
                .build();
    }

    public List<AppointmentResponseDTO> getLastAppointmentsByClientId(long id) {
        Optional<ClientDTO> client = Optional.ofNullable(this.clientService.findById(id));
        if (client.isEmpty()) {
            throw new AppointmentDoesntExistException("Client does not exist");
        }
        return  this.appointmentRepository.findAllByPetClientId(id).stream()
                .filter(appointment -> appointment.getStatus().equals(Status.SUCCESSFULLY)).
                map(appointmentEntity -> AppointmentResponseDTO.builder()
                        .startTime(appointmentEntity.getStartDate())
                        .endTime(appointmentEntity.getEndDate())
                        .reason(appointmentEntity.getReason())
                        .aproved(appointmentEntity.isApproved())
                        .petName(appointmentEntity.getPet().getName())
                        .doctorName(appointmentEntity.getDoctor().getName() +" " + appointmentEntity.getDoctor().getSurname())
                        .build()).collect(Collectors.toList());
    }

    public List<AppointmentResponseDTO> getAllAppointmentsByPetId(long id) {
      Optional <PetEntity> pet = Optional.ofNullable(this.petService.findById(id));
        if(pet.isEmpty()){
            throw new AppointmentDoesntExistException("Pet does not exist");
        }
        return this.appointmentRepository.findAllByPetId(id).stream()
                .filter(appointment -> appointment.getStatus().equals(Status.SUCCESSFULLY)).
                map(appointmentEntity -> AppointmentResponseDTO.builder()
                        .startTime(appointmentEntity.getStartDate())
                        .endTime(appointmentEntity.getEndDate())
                        .reason(appointmentEntity.getReason())
                        .aproved(appointmentEntity.isApproved())
                        .petName(appointmentEntity.getPet().getName())
                        .doctorName(appointmentEntity.getDoctor().getName() + " " + appointmentEntity.getDoctor().getSurname())
                        .build()).collect(Collectors.toList());
    }

    /**
     * Obtiene todas las citas de una mascota (incluyendo las programadas TO_BEGIN)
     * Útil para mostrar la próxima cita programada
     */
    public List<AppointmentResponseDTO> getAllAppointmentsByPetIdIncludingScheduled(long id) {
        Optional<PetEntity> pet = Optional.ofNullable(this.petService.findById(id));
        if(pet.isEmpty()){
            throw new AppointmentDoesntExistException("Pet does not exist");
        }
        return this.appointmentRepository.findAllByPetId(id).stream()
                .filter(appointment -> 
                    appointment.getStatus().equals(Status.SUCCESSFULLY) || 
                    appointment.getStatus().equals(Status.TO_BEGIN))
                .map(appointmentEntity -> AppointmentResponseDTO.builder()
                        .startTime(appointmentEntity.getStartDate())
                        .endTime(appointmentEntity.getEndDate())
                        .reason(appointmentEntity.getReason())
                        .aproved(appointmentEntity.isApproved())
                        .status(appointmentEntity.getStatus())
                        .petName(appointmentEntity.getPet().getName())
                        .doctorName(appointmentEntity.getDoctor().getName() + " " + appointmentEntity.getDoctor().getSurname())
                        .build())
                .collect(Collectors.toList());
    }

    public List<AppointmentScheduleDTO> getScheduleAppointmentsDoctorForToday(long id) {
        if(!doctorService.doctorExistById(id)){
            throw new AppointmentDoesntExistException("Doctor does not exist");
        }
        return this.appointmentRepository.findAllByDoctorIdOrderByStartDateAsc(id).stream()
                .filter(appointment -> appointment.getStartDate().isAfter(LocalDateTime.now()))
                .map(appointmentEntity -> {
                    String clientName = appointmentEntity.getPet() != null && appointmentEntity.getPet().getClient() != null
                            ? appointmentEntity.getPet().getClient().getName()
                            : "Sin cliente asignado";

                    String petName = appointmentEntity.getPet() != null
                            ? appointmentEntity.getPet().getName()
                            : "Sin mascota asignada";

                    return AppointmentScheduleDTO.builder()
                            .startTime(appointmentEntity.getStartDate())
                            .clientName(clientName)
                            .reason(appointmentEntity.getReason())
                            .petName(petName)
                            .doctorName(appointmentEntity.getDoctor().getName() + " " + appointmentEntity.getDoctor().getSurname())
                            .build();
                })
                .collect(Collectors.toList());

    }



    public boolean petHasAppointment(long id) {
        List<AppointmentEntity> appointments = this.appointmentRepository.findAllByPetId(id);
        if(!appointments.isEmpty()){
           return true;
        }
       return false;
    }

    public List<AppointmentResponseDTO> getAvailableAppointments() {
        return this.appointmentRepository.findAll().stream()
                .filter(appointment -> appointment.getStatus().equals(Status.AVAILABLE))
                .map(appointmentEntity -> AppointmentResponseDTO.builder()
                        .startTime(appointmentEntity.getStartDate())
                        .endTime(appointmentEntity.getEndDate())
                        .reason(appointmentEntity.getReason())
                        .aproved(appointmentEntity.isApproved())
                        .status(appointmentEntity.getStatus())
                        .petName("No hay mascota asignada")
                        .doctorName(appointmentEntity.getDoctor().getName()+  " " + appointmentEntity.getDoctor().getSurname())
                        .build()).collect(Collectors.toList());
    }

    @Transactional
    public void createMultipleAppointments(Long doctorId, LocalDateTime startDate, LocalDateTime endDate, Reason reason) {
        if (startDate == null || endDate == null || reason == null) {
            throw new IllegalArgumentException("Start date, end date and reason must be provided");
        }
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        DoctorEntity doctorEntity = this.doctorService.findById1(doctorId);

        Duration duration = Duration.between(startDate, endDate);
        long minutes = duration.toMinutes();
        long blocksDuration = reason.getDuration();

        if (blocksDuration <= 0) {
            throw new IllegalArgumentException("Block duration must be positive");
        }

        for (long i = 0; i + blocksDuration <= minutes; i += blocksDuration) {
            LocalDateTime blockStart = startDate.plusMinutes(i);
            LocalDateTime blockEnd = blockStart.plusMinutes(blocksDuration);

            AppointmentEntity appointment = AppointmentEntity.builder()
                    .startDate(blockStart)
                    .endDate(blockEnd)
                    .reason(reason)
                    .doctor(doctorEntity)
                    .status(Status.AVAILABLE)
                    .approved(false)
                    .build();

            if (!isOverlapping(appointment)) {
                this.appointmentRepository.save(appointment);
            }
        }
    }

    @Transactional
    public void uploadAvailibility(Long id, DoctorAvailabilityDTO availabilityDTO){

        if (availabilityDTO.getStart() == null || availabilityDTO.getEnd() == null || availabilityDTO.getReason() == null) {
            throw new IllegalArgumentException("Start, end and reason must be provided");
        }
        if (availabilityDTO.getStart().isAfter(availabilityDTO.getEnd())) {
            throw new IllegalArgumentException("Start must be before end");
        }
        DoctorEntity doctorEntity = this.doctorService.findById1(id);

         Duration duration = Duration.between(availabilityDTO.getStart(),availabilityDTO.getEnd());
         long minutes = duration.toMinutes();
         long blocksDuration =availabilityDTO.getReason().getDuration();

        if (blocksDuration <= 0) {
            throw new IllegalArgumentException("Block duration must be positive");
        }



         for(long i = 0; i+ blocksDuration <= minutes; i+=blocksDuration){
             LocalDateTime blockStart = availabilityDTO.getStart().plusMinutes(i);
             LocalDateTime blockEnd = blockStart.plusMinutes(blocksDuration);
             this.appointmentRepository.save(AppointmentEntity.builder()
                             .startDate(blockStart)
                             .endDate(blockEnd)
                             .reason(availabilityDTO.getReason())
                             .doctor(doctorEntity)
                             .status(Status.AVAILABLE)
                             .approved(false)
                             .build());
         }
    }

    /**
     * Obtiene todas las citas disponibles para un motivo específico (futuras)
     * Útil para mostrar días disponibles en el calendario
     */
    public List<AvailableAppointmentDTO> getAvailableAppointmentsByReason(Reason reason) {
        LocalDateTime now = LocalDateTime.now();
        List<AppointmentEntity> appointments = this.appointmentRepository
                .findAllByReasonAndStatusAndPetIsNullAndStartDateAfter(reason, Status.AVAILABLE, now);
        
        return appointments.stream()
                .map(appointment -> AvailableAppointmentDTO.builder()
                        .appointmentId(appointment.getId())
                        .startTime(appointment.getStartDate())
                        .endTime(appointment.getEndDate())
                        .doctorName(appointment.getDoctor().getName() + " " + appointment.getDoctor().getSurname())
                        .doctorId(appointment.getDoctor().getId())
                        .doctorSpeciality(appointment.getDoctor().getSpeciality())
                        .reason(appointment.getReason())
                        .build())
                .sorted((a1, a2) -> a1.getStartTime().compareTo(a2.getStartTime()))
                .collect(Collectors.toList());
    }

    /**
     * Obtiene las citas disponibles para un motivo en un día específico
     * Útil para mostrar horarios disponibles cuando el usuario selecciona un día
     */
    public List<AvailableAppointmentDTO> getAvailableAppointmentsByReasonAndDate(Reason reason, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        List<AppointmentEntity> appointments = this.appointmentRepository
                .findAllByReasonAndStatusAndPetIsNullAndStartDateBetween(
                        reason, Status.AVAILABLE, startOfDay, endOfDay);
        
        return appointments.stream()
                .map(appointment -> AvailableAppointmentDTO.builder()
                        .appointmentId(appointment.getId())
                        .startTime(appointment.getStartDate())
                        .endTime(appointment.getEndDate())
                        .doctorName(appointment.getDoctor().getName() + " " + appointment.getDoctor().getSurname())
                        .doctorId(appointment.getDoctor().getId())
                        .doctorSpeciality(appointment.getDoctor().getSpeciality())
                        .reason(appointment.getReason())
                        .build())
                .sorted((a1, a2) -> a1.getStartTime().compareTo(a2.getStartTime()))
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los días únicos que tienen citas disponibles para un motivo
     * Útil para resaltar días en el calendario
     */
    public List<LocalDate> getAvailableDaysByReason(Reason reason) {
        List<AvailableAppointmentDTO> appointments = getAvailableAppointmentsByReason(reason);
        return appointments.stream()
                .map(appointment -> appointment.getStartTime().toLocalDate())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    public AppointmentEntity toEntity(AppointmentDTO dto) {
        return AppointmentEntity.builder()
                .startDate(dto.getStartTime())
                .endDate(dto.getEndTime())
                .reason(dto.getReason())
                .status(dto.getStatus())
                .doctor(this.doctorService.findById1(dto.getDoctor()))
                .approved(dto.getAproved())
                .build();
    }

    @Override
    public AppointmentDTO toDTO(AppointmentEntity entity) {
        return AppointmentDTO.builder()
                .startTime(entity.getStartDate())
                .endTime(entity.getEndDate())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .doctor(entity.getDoctor().getId())
                .aproved(entity.isApproved())
                .build();
    }
}
