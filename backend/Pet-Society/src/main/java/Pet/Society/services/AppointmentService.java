package Pet.Society.services;

import Pet.Society.models.dto.appointment.AppointmentDTO;
import Pet.Society.models.dto.appointment.AppointmentHistoryDTO;
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
import Pet.Society.models.entities.DiagnosesEntity;
import Pet.Society.models.entities.DoctorEntity;
import Pet.Society.models.entities.PetEntity;
import Pet.Society.models.enums.PetType;
import Pet.Society.models.enums.Reason;
import Pet.Society.models.dto.appointment.AppointmentDTORequest;
import Pet.Society.models.enums.Status;
import Pet.Society.models.exceptions.AppointmentDoesntExistException;
import Pet.Society.models.exceptions.DoctorNotFoundException;
import Pet.Society.models.exceptions.DuplicatedAppointmentException;
import Pet.Society.models.exceptions.UnavailableAppointmentException;
import Pet.Society.models.interfaces.Mapper;
import Pet.Society.repositories.AppointmentRepository;
import Pet.Society.repositories.DiagnosesRepository;
import jakarta.transaction.Transactional;
import org.aspectj.weaver.patterns.ThisOrTargetAnnotationPointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cglib.core.Local;
import org.springframework.context.ApplicationContextException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.DoubleStream;


@Service
public class AppointmentService implements Mapper<AppointmentDTO,AppointmentEntity> {

    private final AppointmentRepository appointmentRepository;
    private final DiagnosesRepository diagnosesRepository;
    private final DoctorService doctorService;
    private final PetService petService;
    private final ClientService clientService;
    private final HttpMessageConverters messageConverters;
    
    // Zona horaria de Argentina
    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");
    
    /**
     * Obtiene la fecha y hora actual en la zona horaria de Argentina
     * @return LocalDateTime con la hora actual de Argentina
     */
    private LocalDateTime getCurrentDateTimeArgentina() {
        return ZonedDateTime.now(ARGENTINA_ZONE).toLocalDateTime();
    }


    @Autowired
    public AppointmentService(AppointmentRepository appointmentRepository, DiagnosesRepository diagnosesRepository, DoctorService doctorService, PetService petService, ClientService clientService, HttpMessageConverters messageConverters) {
        this.appointmentRepository = appointmentRepository;
        this.diagnosesRepository = diagnosesRepository;
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

        if(appointmentDTO.getStartTime().isBefore(LocalDateTime.now())){
            throw new IllegalArgumentException("The appointment must be in the future");
        }

        AppointmentEntity appointment = AppointmentEntity.builder()
                                        .startDate(appointmentDTO.getStartTime())
                                        .endDate(appointmentDTO.getEndTime())
                                        .reason(appointmentDTO.getReason())
                                        .status(Status.AVAILABLE)
                                        .doctor(findDoctor)
                                        .approved(false)
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
        // Validar que la cita esté disponible (no cancelada ni completada)
        if (findAppointment.getStatus() != Status.AVAILABLE) {
            throw new UnavailableAppointmentException("Esta cita no está disponible para asignar");
        }

        Optional<PetEntity> findPet =Optional.ofNullable(this.petService.findById(dto.getPetId())) ;

        // Validar que la mascota no tenga ya una cita programada (TO_BEGIN)
        List<AppointmentEntity> existingAppointments = this.appointmentRepository.findAllByPetId(dto.getPetId());
        boolean hasScheduledAppointment = existingAppointments.stream()
                .anyMatch(apt -> apt.getStatus().equals(Status.TO_BEGIN) && 
                               apt.getStartDate().isAfter(getCurrentDateTimeArgentina()));
        
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

    public List<AppointmentResponseDTO>getAllAppointmets(){
        return this.appointmentRepository.findAll().stream().map(appointmentEntity -> {
            String petName = appointmentEntity.getPet() != null 
                ? appointmentEntity.getPet().getName() 
                : "No hay mascota asignada";
            
            String clientName = null;
            if (appointmentEntity.getPet() != null && appointmentEntity.getPet().getClient() != null) {
                clientName = appointmentEntity.getPet().getClient().getName() + " " + 
                            appointmentEntity.getPet().getClient().getSurname();
            }
            
            AppointmentResponseDTO.AppointmentResponseDTOBuilder builder = AppointmentResponseDTO.builder()
                        .id(appointmentEntity.getId())
                        .startTime(appointmentEntity.getStartDate())
                        .endTime(appointmentEntity.getEndDate())
                        .reason(appointmentEntity.getReason())
                        .aproved(appointmentEntity.isApproved())
                        .status(appointmentEntity.getStatus())
                        .petName(petName)
                        .doctorName(appointmentEntity.getDoctor().getName()+  " " + appointmentEntity.getDoctor().getSurname());
            
            if (clientName != null) {
                builder.clientName(clientName);
            }
            
            return builder.build();
        }).collect(Collectors.toList());
    }

    @Transactional
    public void cancelAppointment(long id) {
        Optional<AppointmentEntity> existingAppointment = this.appointmentRepository.findById(id);

        if (existingAppointment.isEmpty()) {
            throw new AppointmentDoesntExistException("Appointment does not exist");
        }

        AppointmentEntity appointment = existingAppointment.get();
        LocalDateTime now = getCurrentDateTimeArgentina();
        long hoursUntilAppointment = Duration.between(now, appointment.getStartDate()).toHours();

        // Guardar la referencia a la mascota ANTES de modificar la cita
        // Esto asegura que la relación se mantiene incluso si hay problemas con lazy loading
        PetEntity petReference = appointment.getPet();
        
        // Marcar la cita como cancelada pero mantener la referencia a la mascota para el historial
        appointment.setStatus(Status.CANCELED);
        
        // Asegurar explícitamente que el pet se mantiene - NO borrar para mantener el historial
        // Esto es crítico para mantener la persistencia del registro de citas
        if (petReference != null) {
            appointment.setPet(petReference);
        }
        
        // Guardar la cita cancelada con la referencia a la mascota intacta
        AppointmentEntity savedAppointment = this.appointmentRepository.save(appointment);
        
        // Verificar que la referencia se mantuvo después de guardar
        if (savedAppointment.getPet() == null && petReference != null) {
            // Si por alguna razón se perdió, restaurarla explícitamente
            savedAppointment.setPet(petReference);
            this.appointmentRepository.save(savedAppointment);
        }

        // Si se cancela con más de 24 horas de anticipación, crear una nueva cita disponible
        if (hoursUntilAppointment >= 24) {
            AppointmentEntity newAvailableAppointment = AppointmentEntity.builder()
                    .startDate(appointment.getStartDate())
                    .endDate(appointment.getEndDate())
                    .reason(appointment.getReason())
                    .doctor(appointment.getDoctor())
                    .status(Status.AVAILABLE)
                    .approved(appointment.isApproved())
                    .pet(null) // La nueva cita disponible no tiene mascota asignada
                    .build();

            // Verificar que no se solape con otra cita existente (excluyendo la que acabamos de cancelar)
            if (!isOverlappingExcludingAppointment(newAvailableAppointment, appointment.getId())) {
                this.appointmentRepository.save(newAvailableAppointment);
            }
        }
    }

    @Transactional
    public AppointmentResponseDTO approveAppointment(Long id){
        // Primero verificar que existe
        AppointmentEntity appointment = this.appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentDoesntExistException("Appointment does not exist"));

        // Actualizar directamente en la base de datos usando un query nativo para evitar validaciones
        this.appointmentRepository.updateApprovedStatus(id, true);
        
        // Recargar la entidad para obtener los datos actualizados
        AppointmentEntity updatedAppointment = this.appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentDoesntExistException("Appointment does not exist"));
        
        String message = updatedAppointment.getPet() == null ? "No hay mascota asignada" : updatedAppointment.getPet().getName();
        return AppointmentResponseDTO.builder()
                .id(updatedAppointment.getId())
                .startTime(updatedAppointment.getStartDate())
                .endTime(updatedAppointment.getEndDate())
                .reason(updatedAppointment.getReason())
                .doctorName(updatedAppointment.getDoctor().getName()+ " " +updatedAppointment.getDoctor().getSurname())
                .aproved(updatedAppointment.isApproved())
                .status(updatedAppointment.getStatus())
                .petName(message)
                .build();
    }

    @Transactional
    public AppointmentResponseDTO disapproveAppointment(Long id){
        // Primero verificar que existe
        AppointmentEntity appointment = this.appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentDoesntExistException("Appointment does not exist"));

        // Actualizar directamente en la base de datos usando un query nativo para evitar validaciones
        this.appointmentRepository.updateApprovedStatus(id, false);
        
        // Recargar la entidad para obtener los datos actualizados
        AppointmentEntity updatedAppointment = this.appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentDoesntExistException("Appointment does not exist"));
        
        String message = updatedAppointment.getPet() == null ? "No hay mascota asignada" : updatedAppointment.getPet().getName();
        return AppointmentResponseDTO.builder()
                .id(updatedAppointment.getId())
                .startTime(updatedAppointment.getStartDate())
                .endTime(updatedAppointment.getEndDate())
                .reason(updatedAppointment.getReason())
                .doctorName(updatedAppointment.getDoctor().getName()+ " " +updatedAppointment.getDoctor().getSurname())
                .aproved(updatedAppointment.isApproved())
                .status(updatedAppointment.getStatus())
                .petName(message)
                .build();
    }

    /**
     * Obtiene el ID de la cita programada (TO_BEGIN) de una mascota
     * Útil para cancelar citas desde el frontend
     */
    public Long getScheduledAppointmentIdByPetId(long petId) {
        List<AppointmentEntity> appointments = this.appointmentRepository.findAllByPetId(petId);
        LocalDateTime now = getCurrentDateTimeArgentina();
        
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
        Optional<AppointmentEntity> existingAppointment = this.appointmentRepository.findByIdWithDiagnoses(id);
        if (existingAppointment.isEmpty()) {
            throw new AppointmentDoesntExistException("Appointment does not exist");
        }
        //This variable is for put in the pet name. For some reason, the method fails if there are not a Pet in the Appointment
        String message = existingAppointment.get().getPet() == null ? "No hay mascota asignada" : existingAppointment.get().getPet().getName();
        AppointmentEntity appointment = existingAppointment.get();
        AppointmentResponseDTO.AppointmentResponseDTOBuilder builder = AppointmentResponseDTO.builder()
                .id(appointment.getId())
                .startTime(appointment.getStartDate())
                .endTime(appointment.getEndDate())
                .reason(appointment.getReason())
                .doctorName(appointment.getDoctor().getName()+ " " +appointment.getDoctor().getSurname())
                .aproved(appointment.isApproved())
                .status(appointment.getStatus())
                .petName(message);
        
        // Agregar nombre del cliente si existe la mascota
        if (appointment.getPet() != null && appointment.getPet().getClient() != null) {
            builder.clientName(appointment.getPet().getClient().getName() + " " + appointment.getPet().getClient().getSurname());
        }
        
        // Buscar diagnóstico directamente por appointmentId en la tabla de diagnósticos
        Optional<DiagnosesEntity> diagnosis = this.diagnosesRepository.findByAppointmentId(id);
        if (diagnosis.isPresent()) {
            DiagnosesEntity diagnosesEntity = diagnosis.get();
            builder.diagnose(diagnosesEntity.getDiagnose())
                   .treatment(diagnosesEntity.getTreatment());
        }
        
        return builder.build();
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

    public List<AppointmentHistoryDTO> getAllAppointmentsHistoryByClientId(long clientId) {
        // Primero marcar como completadas las citas que ya pasaron el tiempo límite
        markExpiredAppointmentsAsCompleted();
        
        Optional<ClientDTO> client = Optional.ofNullable(this.clientService.findById(clientId));
        if (client.isEmpty()) {
            throw new AppointmentDoesntExistException("Client does not exist");
        }
        
        return this.appointmentRepository.findAllByPetClientId(clientId).stream()
                .filter(appointment -> appointment.getPet() != null) // Solo citas asignadas a mascotas
                .sorted((a1, a2) -> a2.getStartDate().compareTo(a1.getStartDate())) // Ordenar por fecha descendente (más recientes primero)
                .map(appointmentEntity -> AppointmentHistoryDTO.builder()
                        .appointmentId(appointmentEntity.getId())
                        .startTime(appointmentEntity.getStartDate())
                        .endTime(appointmentEntity.getEndDate())
                        .doctorName(appointmentEntity.getDoctor().getName() + " " + appointmentEntity.getDoctor().getSurname())
                        .doctorId(appointmentEntity.getDoctor().getId())
                        .doctorSpeciality(appointmentEntity.getDoctor().getSpeciality())
                        .petName(appointmentEntity.getPet().getName())
                        .petId(appointmentEntity.getPet().getId())
                        .petType(appointmentEntity.getPet().getPetType())
                        .otherType(appointmentEntity.getPet().getOtherType())
                        .reason(appointmentEntity.getReason())
                        .status(appointmentEntity.getStatus())
                        .hasDiagnosis(appointmentEntity.getDiagnoses() != null)
                        .diagnosisId(appointmentEntity.getDiagnoses() != null ? appointmentEntity.getDiagnoses().getId() : null)
                        .build())
                .collect(Collectors.toList());
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

    public List<AppointmentHistoryDTO> getAllPastAppointmentsByDoctorId(long doctorId){
        // Primero marcar como completadas las citas que ya pasaron el tiempo límite
        markExpiredAppointmentsAsCompleted();
        
        Optional <DoctorEntity> doctor = Optional.ofNullable(this.doctorService.findById1(doctorId));

        if (doctor.isEmpty()){
            throw new DoctorNotFoundException("Doctor does not exist");
        }

        LocalDateTime now = getCurrentDateTimeArgentina();

        return this.appointmentRepository.findAllByDoctorId(doctorId).stream()
                .filter(appointment -> {
                    // Filtrar solo citas pasadas (fecha de inicio anterior a ahora)
                    // Incluir todas las citas pasadas independientemente del estado
                    // (SUCCESSFULLY, CANCELED, etc.) para tener un historial completo
                    return appointment.getStartDate().isBefore(now) && 
                           appointment.getPet() != null; // Solo citas con mascota asignada
                })
                .map(appointmentEntity -> {
                    // Manejar casos donde el cliente puede ser null
                    String clientName = appointmentEntity.getPet() != null && 
                                      appointmentEntity.getPet().getClient() != null
                                      ? appointmentEntity.getPet().getClient().getName() + " " + 
                                        appointmentEntity.getPet().getClient().getSurname()
                                      : "Sin cliente asignado";
                    
                    return AppointmentHistoryDTO.builder()
                            .appointmentId(appointmentEntity.getId())
                            .startTime(appointmentEntity.getStartDate())
                            .endTime(appointmentEntity.getEndDate())
                            .doctorName(appointmentEntity.getDoctor().getName() + " " + appointmentEntity.getDoctor().getSurname())
                            .doctorId(appointmentEntity.getDoctor().getId())
                            .doctorSpeciality(appointmentEntity.getDoctor().getSpeciality())
                            .clientName(clientName)
                            .petName(appointmentEntity.getPet() != null ? appointmentEntity.getPet().getName() : "Sin mascota asignada")
                            .petId(appointmentEntity.getPet() != null ? appointmentEntity.getPet().getId() : 0)
                            .petType(appointmentEntity.getPet() != null ? appointmentEntity.getPet().getPetType() : null)
                            .otherType(appointmentEntity.getPet() != null ? appointmentEntity.getPet().getOtherType() : null)
                            .reason(appointmentEntity.getReason())
                            .status(appointmentEntity.getStatus())
                            .hasDiagnosis(appointmentEntity.getDiagnoses() != null)
                            .diagnosisId(appointmentEntity.getDiagnoses() != null ? appointmentEntity.getDiagnoses().getId() : null)
                            .build();
                })
                .collect(Collectors.toList());
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

    public Page<AppointmentScheduleDTO> getScheduleAppointmentsDoctorForToday(long id, Pageable pageable) {
        // Primero marcar como completadas las citas que ya pasaron el tiempo límite
        markExpiredAppointmentsAsCompleted();
        
        if (!doctorService.doctorExistById(id)) {
            throw new AppointmentDoesntExistException("Doctor does not exist");
        }

        // Llamamos al repositorio con el filtro de fecha
        Page<AppointmentEntity> page = appointmentRepository.findAllByDoctorIdOrderByStartDateAsc(
                id, getCurrentDateTimeArgentina(), pageable);

        // Mapeamos las entidades a DTO, conservando la paginación
        return page.map(appointmentEntity -> {
            String clientName = appointmentEntity.getPet() != null && appointmentEntity.getPet().getClient() != null
                    ? appointmentEntity.getPet().getClient().getName()
                    : "Sin cliente asignado";

            String petName = appointmentEntity.getPet() != null
                    ? appointmentEntity.getPet().getName()
                    : "Sin mascota asignada";

            Long petId = appointmentEntity.getPet() != null
                    ? appointmentEntity.getPet().getId()
                    : 0L;

            return AppointmentScheduleDTO.builder()
                    .id(appointmentEntity.getId())
                    .startTime(appointmentEntity.getStartDate())
                    .endTime(appointmentEntity.getEndDate())
                    .clientName(clientName)
                    .reason(appointmentEntity.getReason())
                    .petId(petId)
                    .petName(petName)
                    .doctorName(appointmentEntity.getDoctor().getName() + " " + appointmentEntity.getDoctor().getSurname())
                    .hasDiagnose(appointmentEntity.getDiagnoses() != null)
                    .diagnosisId(appointmentEntity.getDiagnoses() != null ? appointmentEntity.getDiagnoses().getId() : null)
                    .build();
        });
    }




    public boolean petHasAppointment(long id) {
        List<AppointmentEntity> appointments = this.appointmentRepository.findAllByPetId(id);
        if(!appointments.isEmpty()){
           return true;
        }
       return false;
    }

    /**
     * Marca automáticamente las citas AVAILABLE pasadas como CANCELED
     * Una cita disponible se cancela si ya pasó su hora de inicio y nadie la reservó
     * Esto evita que aparezcan citas disponibles que ya pasaron
     */
    @Transactional
    public void cancelExpiredAvailableAppointments() {
        try {
            LocalDateTime now = getCurrentDateTimeArgentina();
            // Buscar solo citas AVAILABLE para optimizar la consulta
            List<AppointmentEntity> allAvailable = this.appointmentRepository.findAll().stream()
                    .filter(appointment -> appointment.getStatus() != null && appointment.getStatus().equals(Status.AVAILABLE))
                    .collect(Collectors.toList());
            
            // Filtrar las que ya pasó su hora de inicio y no tienen cliente asignado
            List<AppointmentEntity> expiredAppointments = allAvailable.stream()
                    .filter(appointment -> 
                        appointment.getStartDate() != null &&
                        appointment.getStartDate().isBefore(now) && // Ya pasó la hora de inicio
                        appointment.getPet() == null // Solo citas sin cliente asignado
                    )
                    .collect(Collectors.toList());
            
            // Actualizar en batch si hay muchas, o individualmente si son pocas
            if (!expiredAppointments.isEmpty()) {
                for (AppointmentEntity appointment : expiredAppointments) {
                    appointment.setStatus(Status.CANCELED);
                    this.appointmentRepository.save(appointment);
                }
            }
        } catch (Exception e) {
            // Si hay algún error, simplemente no cancelar las citas para no romper el flujo
            // El filtro por fecha en los métodos de consulta seguirá funcionando
            System.err.println("Error al cancelar citas expiradas: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Marca automáticamente como completadas las citas que ya pasaron el tiempo límite para emitir diagnóstico
     * Una cita se marca como completada si:
     * - Tiene cliente asignado (pet != null)
     * - Está en estado TO_BEGIN (programada)
     * - Ya pasó 1 hora después de su hora de finalización
     * - No tiene diagnóstico
     * Esto evita que las citas queden en estado "programadas" indefinidamente
     */
    @Transactional
    public void markExpiredAppointmentsAsCompleted() {
        try {
            LocalDateTime now = getCurrentDateTimeArgentina();
            // Buscar citas programadas con cliente asignado
            List<AppointmentEntity> scheduledAppointments = this.appointmentRepository.findAll().stream()
                    .filter(appointment -> 
                        appointment.getStatus() != null && 
                        appointment.getStatus().equals(Status.TO_BEGIN) &&
                        appointment.getPet() != null // Solo citas con cliente asignado
                    )
                    .collect(Collectors.toList());
            
            // Filtrar las que ya pasó 1 hora después de su hora de finalización y no tienen diagnóstico
            List<AppointmentEntity> expiredAppointments = scheduledAppointments.stream()
                    .filter(appointment -> 
                        appointment.getEndDate() != null &&
                        appointment.getEndDate().plusHours(1).isBefore(now) && // Ya pasó 1 hora después de la finalización
                        appointment.getDiagnoses() == null // No tienen diagnóstico
                    )
                    .collect(Collectors.toList());
            
            // Marcar como completadas
            if (!expiredAppointments.isEmpty()) {
                for (AppointmentEntity appointment : expiredAppointments) {
                    appointment.setStatus(Status.SUCCESSFULLY);
                    this.appointmentRepository.save(appointment);
                }
            }
        } catch (Exception e) {
            // Si hay algún error, simplemente no marcar las citas para no romper el flujo
            System.err.println("Error al marcar citas expiradas como completadas: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public List<AppointmentResponseDTO> getAvailableAppointments() {
        // Primero cancelar citas disponibles que ya pasaron
        cancelExpiredAvailableAppointments();
        // Marcar como completadas las citas programadas que ya pasaron el tiempo límite
        markExpiredAppointmentsAsCompleted();
        
        // Luego obtener solo las citas disponibles futuras (que aún no comenzaron)
        LocalDateTime now = getCurrentDateTimeArgentina();
        return this.appointmentRepository.findAll().stream()
                .filter(appointment -> 
                    appointment.getStatus().equals(Status.AVAILABLE) &&
                    appointment.getStartDate().isAfter(now) // Solo citas que aún no comenzaron
                )
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
        
        // Obtener la fecha/hora actual en Argentina
        LocalDateTime now = getCurrentDateTimeArgentina();
        
        // Parsear minHour y maxHour si están presentes (hacerlo antes de ajustar fechas)
        LocalTime minTime = null;
        LocalTime maxTime = null;
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        if (availabilityDTO.getMinHour() != null && !availabilityDTO.getMinHour().isEmpty()) {
            try {
                minTime = LocalTime.parse(availabilityDTO.getMinHour(), timeFormatter);
            } catch (Exception e) {
                throw new IllegalArgumentException("Formato de hora mínima inválido. Use formato HH:mm");
            }
        }
        
        if (availabilityDTO.getMaxHour() != null && !availabilityDTO.getMaxHour().isEmpty()) {
            try {
                maxTime = LocalTime.parse(availabilityDTO.getMaxHour(), timeFormatter);
            } catch (Exception e) {
                throw new IllegalArgumentException("Formato de hora máxima inválido. Use formato HH:mm");
            }
        }
        
        // Validar que minTime < maxTime si ambos están presentes
        if (minTime != null && maxTime != null && !minTime.isBefore(maxTime)) {
            throw new IllegalArgumentException("La hora mínima debe ser anterior a la hora máxima");
        }
        
        // Ajustar las fechas si son del pasado: comenzar desde ahora en adelante
        LocalDateTime adjustedStart = availabilityDTO.getStart();
        if (adjustedStart.isBefore(now)) {
            // Si la fecha de inicio es del pasado, comenzar desde ahora
            // Pero respetar las restricciones de hora si existen
            LocalTime nowTime = now.toLocalTime();
            if (minTime != null && nowTime.isBefore(minTime)) {
                // Si ahora es antes de la hora mínima, comenzar desde la hora mínima de hoy
                adjustedStart = now.toLocalDate().atTime(minTime);
            } else {
                // Comenzar desde ahora
                adjustedStart = now;
            }
        }
        
        // Ajustar adjustedStart si está antes de minTime (aunque sea futura)
        if (minTime != null && adjustedStart.toLocalTime().isBefore(minTime)) {
            adjustedStart = adjustedStart.toLocalDate().atTime(minTime);
        }
        
        // Asegurar que endDate también sea futura
        LocalDateTime adjustedEnd = availabilityDTO.getEnd();
        if (adjustedEnd.isBefore(adjustedStart)) {
            throw new IllegalArgumentException("El rango de fechas debe ser válido y futuro");
        }

        long blocksDuration = availabilityDTO.getReason().getDuration();
        if (blocksDuration <= 0) {
            throw new IllegalArgumentException("Block duration must be positive");
        }

        // Generar todas las citas primero en memoria para validarlas todas antes de guardar
        List<AppointmentEntity> appointmentsToCreate = new ArrayList<>();
        LocalDateTime currentDate = adjustedStart;
        
        // Contador de seguridad para evitar bucles infinitos
        int maxIterations = 10000;
        int iterations = 0;
        
        while (currentDate.isBefore(adjustedEnd) && iterations < maxIterations) {
            iterations++;
            LocalTime currentTime = currentDate.toLocalTime();
            
            // Verificar si la hora actual está dentro del rango permitido (si se especificó)
            boolean isWithinTimeRange = true;
            if (minTime != null && currentTime.isBefore(minTime)) {
                isWithinTimeRange = false;
            }
            if (maxTime != null && (currentTime.isAfter(maxTime) || currentTime.equals(maxTime))) {
                isWithinTimeRange = false;
            }
            
            // Solo crear citas dentro del rango horario permitido
            if (isWithinTimeRange) {
                LocalDateTime blockStart = currentDate;
                LocalDateTime blockEnd = blockStart.plusMinutes(blocksDuration);
                
                // Verificar que el bloque completo esté dentro del rango de fechas
                if (blockEnd.isBefore(adjustedEnd) || blockEnd.isEqual(adjustedEnd)) {
                    // Verificar que el bloque completo esté dentro del rango horario
                    LocalTime blockEndTime = blockEnd.toLocalTime();
                    boolean blockEndWithinRange = true;
                    if (maxTime != null && (blockEndTime.isAfter(maxTime) || blockEndTime.equals(maxTime))) {
                        blockEndWithinRange = false;
                    }
                    
                    if (blockEndWithinRange) {
                        AppointmentEntity appointment = AppointmentEntity.builder()
                                .startDate(blockStart)
                                .endDate(blockEnd)
                                .reason(availabilityDTO.getReason())
                                .doctor(doctorEntity)
                                .status(Status.AVAILABLE)
                                .approved(false)
                                .build();
                        
                        appointmentsToCreate.add(appointment);
                    }
                }
            }
            
            // Avanzar al siguiente bloque
            LocalDateTime nextDate = currentDate.plusMinutes(blocksDuration);
            
            // Si hay restricciones de hora y el siguiente bloque excede el maxTime, avanzar al siguiente día
            if (maxTime != null && nextDate.toLocalTime().isAfter(maxTime)) {
                // Avanzar al siguiente día a la hora mínima (o inicio del día si no hay minTime)
                LocalDate nextDay = currentDate.toLocalDate().plusDays(1);
                currentDate = nextDay.atTime(minTime != null ? minTime : LocalTime.MIN);
            } else {
                currentDate = nextDate;
            }
        }
        
        if (iterations >= maxIterations) {
            throw new IllegalArgumentException("El rango de fechas es demasiado amplio o hay un error en la configuración");
        }
        
        // Validar TODAS las citas antes de crear ninguna
        for (AppointmentEntity appointment : appointmentsToCreate) {
            if (isOverlapping(appointment)) {
                throw new DuplicatedAppointmentException(
                    "Una o más citas del rango seleccionado se solapan con citas existentes. " +
                    "Por favor, revisá la disponibilidad del doctor y elegí un rango diferente."
                );
            }
        }
        
        // Si todas las validaciones pasaron, crear todas las citas
        for (AppointmentEntity appointment : appointmentsToCreate) {
            this.appointmentRepository.save(appointment);
        }
    }

    /**
     * Obtiene todas las citas disponibles para un motivo específico (futuras)
     * Útil para mostrar días disponibles en el calendario
     */
    public List<AvailableAppointmentDTO> getAvailableAppointmentsByReason(Reason reason) {
        // Primero cancelar citas disponibles que ya pasaron
        cancelExpiredAvailableAppointments();
        // Marcar como completadas las citas programadas que ya pasaron el tiempo límite
        markExpiredAppointmentsAsCompleted();
        
        LocalDateTime now = getCurrentDateTimeArgentina();
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
        // Primero cancelar citas disponibles que ya pasaron
        cancelExpiredAvailableAppointments();
        // Marcar como completadas las citas programadas que ya pasaron el tiempo límite
        markExpiredAppointmentsAsCompleted();
        
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        LocalDateTime now = getCurrentDateTimeArgentina();
        
        List<AppointmentEntity> appointments = this.appointmentRepository
                .findAllByReasonAndStatusAndPetIsNullAndStartDateBetween(
                        reason, Status.AVAILABLE, startOfDay, endOfDay)
                .stream()
                .filter(appointment -> appointment.getStartDate().isAfter(now)) // Solo citas que aún no comenzaron
                .collect(Collectors.toList());
        
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
        try {
            // Primero cancelar citas disponibles que ya pasaron (solo una vez)
            cancelExpiredAvailableAppointments();
            // Marcar como completadas las citas programadas que ya pasaron el tiempo límite
            markExpiredAppointmentsAsCompleted();
        } catch (Exception e) {
            // Si falla la cancelación, continuar de todas formas
            System.err.println("Advertencia: No se pudieron cancelar citas expiradas: " + e.getMessage());
        }
        
        // Obtener las citas disponibles futuras directamente
        LocalDateTime now = getCurrentDateTimeArgentina();
        List<AppointmentEntity> appointments = this.appointmentRepository
                .findAllByReasonAndStatusAndPetIsNullAndStartDateAfter(reason, Status.AVAILABLE, now);
        
        return appointments.stream()
                .filter(appointment -> appointment.getStartDate() != null)
                .filter(appointment -> appointment.getStartDate().isAfter(now)) // Asegurar que aún no comenzaron
                .map(appointment -> appointment.getStartDate().toLocalDate())
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
