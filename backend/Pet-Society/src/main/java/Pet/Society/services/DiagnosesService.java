package Pet.Society.services;

import Pet.Society.models.dto.diagnoses.DiagnosesDTO;
import Pet.Society.models.dto.diagnoses.DiagnosesDTOResponse;
import Pet.Society.models.entities.AppointmentEntity;
import Pet.Society.models.entities.DiagnosesEntity;
import Pet.Society.models.enums.Status;
import Pet.Society.models.exceptions.*;
import Pet.Society.models.interfaces.Mapper;
import Pet.Society.repositories.AppointmentRepository;
import Pet.Society.repositories.DiagnosesRepository;
import Pet.Society.repositories.DoctorRepository;
import Pet.Society.repositories.PetRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

@Service
public class DiagnosesService implements Mapper<DiagnosesDTOResponse, DiagnosesEntity> {

    private static final ZoneId ARGENTINA_ZONE = ZoneId.of("America/Argentina/Buenos_Aires");

    private final DiagnosesRepository diagnosesRepository;
    private final AppointmentRepository appointmentRepository;
    
    @PersistenceContext
    private EntityManager entityManager;

    public DiagnosesService(DiagnosesRepository diagnosesRepository,
                            PetRepository petRepository,
                            DoctorRepository doctorRepository,
                            AppointmentRepository appointmentRepository,
                            AppointmentService appointmentService) {
        this.diagnosesRepository = diagnosesRepository;
        this.appointmentRepository = appointmentRepository;

    }

    /**
     * Obtiene la fecha y hora actual en la zona horaria de Argentina
     * @return LocalDateTime con la hora actual de Argentina
     */
    private LocalDateTime getCurrentDateTimeArgentina() {
        return ZonedDateTime.now(ARGENTINA_ZONE).toLocalDateTime();
    }


    @Transactional
    public DiagnosesDTOResponse save(DiagnosesDTO dto) {

        AppointmentEntity appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new AppointmentNotFoundException("Appointment not found"));

        if(appointment.getPet()==null){
            throw new AppointmentWithoutPetException("There is not pets in this appointment");
        }

        // Validar que el diagnóstico se pueda crear hasta 1 hora después de que termine la cita
        // Usar la misma zona horaria que AppointmentService (Argentina)
        LocalDateTime now = getCurrentDateTimeArgentina();
        LocalDateTime appointmentStartTime = appointment.getStartDate();
        LocalDateTime appointmentEndTime = appointment.getEndDate();
        
        // Validar que las fechas de la cita no sean nulas
        if (appointmentStartTime == null || appointmentEndTime == null) {
            throw new BeforeAppointmentException("La cita no tiene fechas válidas.");
        }
        
        // Calcular el tiempo máximo permitido: 1 hora después de la finalización
        // Agregamos 5 minutos de margen de tolerancia para evitar problemas de precisión y desincronización
        // entre cliente y servidor, y posibles diferencias de zona horaria
        // Esto asegura que el usuario tenga suficiente tiempo incluso si hay pequeñas diferencias de tiempo
        LocalDateTime maxAllowedTime = appointmentEndTime.plusHours(1).plusMinutes(5);

        // No se puede crear antes de que comience la cita
        if (now.isBefore(appointmentStartTime)) {
            throw new BeforeAppointmentException("No se puede crear un diagnóstico antes de que comience la cita.");
        }

        // Se puede crear hasta 1 hora después de que termine la cita (con 5 minutos de margen de tolerancia)
        // Esto evita problemas de precisión de segundos y posibles desincronizaciones de zona horaria
        // entre el cliente y el servidor. El margen de 5 minutos debería ser suficiente para cubrir
        // cualquier diferencia de tiempo entre sistemas
        if (now.isAfter(maxAllowedTime)) {
            throw new BeforeAppointmentException("No se puede crear un diagnóstico después de 1 hora de haber terminado la cita.");
        }

        // Crear el diagnóstico con todas las relaciones ya cargadas
        DiagnosesEntity diagnosis = DiagnosesEntity.builder()
                .diagnose(dto.getDiagnose())
                .treatment(dto.getTreatment())
                .doctor(appointment.getDoctor())
                .pet(appointment.getPet())
                .appointment(appointment)
                .date(getCurrentDateTimeArgentina()) // Usar la hora de Argentina en lugar de LocalDateTime.now()
                .build();

        // Guardar primero el diagnóstico
        DiagnosesEntity savedDiagnosis = this.diagnosesRepository.save(diagnosis);
        
        // Actualizar el appointment usando queries nativos que eviten todas las validaciones
        // Esto es necesario porque la cita puede haber pasado (estamos dentro de la hora extra permitida)
        // Los queries nativos actualizan directamente en la BD sin validar Bean Validation
        
        // Actualizar el status y la relación con diagnoses en una sola operación usando query nativo
        // El status se almacena como ordinal (0=CANCELED, 1=RESCHEDULED, 2=SUCCESSFULLY, 3=TO_BEGIN, 4=AVAILABLE)
        entityManager.createNativeQuery(
            "UPDATE appointments SET status = :status, diagnoses_id = :diagnosesId WHERE id = :appointmentId"
        )
        .setParameter("status", Status.SUCCESSFULLY.ordinal())
        .setParameter("diagnosesId", savedDiagnosis.getId())
        .setParameter("appointmentId", appointment.getId())
        .executeUpdate();
        
        // Flush para asegurar que los cambios se persistan antes de recargar
        this.diagnosesRepository.flush();
        entityManager.flush();
        
        // Recargar el diagnóstico con todas sus relaciones usando JOIN FETCH para evitar problemas de lazy loading
        DiagnosesEntity diagnosisWithRelations = this.diagnosesRepository.findByIdWithRelations(savedDiagnosis.getId())
                .orElseThrow(() -> new DiagnosesNotFoundException("Diagnosis not found after save"));

        return toDTO(diagnosisWithRelations);
    }

    public DiagnosesDTOResponse findById(Long id) {
        return toDTO(diagnosesRepository.findById(id)
                .orElseThrow(() -> new DiagnosesNotFoundException("Diagnosis " + id + " not found")));
    }


    public DiagnosesDTOResponse findLastById(long id) {
        if (diagnosesRepository.findLastById(id).isPresent()) {
            DiagnosesEntity diagnosis = diagnosesRepository.findLastById(id).get();
            return toDTO(diagnosis);
        } else {
            throw new DiagnosesNotFoundException("Diagnosis " + id + " not found");
        }
    }

    public Page<DiagnosesDTOResponse> findByPetClientId(long id, Pageable pageable) {
        Page<DiagnosesEntity> diagnoses = this.diagnosesRepository.findByPetClientId(id, pageable);
        if(diagnoses.isEmpty()){
            return Page.empty();
        }
        return diagnoses.map(this::toDTO);
    }

    public Page<DiagnosesDTOResponse> findByPetId(long id, Pageable pageable) {
        if (diagnosesRepository.findByPetId(id, pageable).isEmpty()) {
            throw new DiagnosesNotFoundException("Diagnoses of Pet id : " + id + " not found");
        }
        return diagnosesRepository.findByPetId(id, pageable).map(this::toDTO);

    }

    public Page<DiagnosesDTOResponse> findAll(Pageable pageable) {
        return diagnosesRepository.findAll(pageable).map(this::toDTO);
    }

    public Page<DiagnosesDTOResponse> findByDoctorId(long id, Pageable pageable) {

        if (diagnosesRepository.findByDoctorId(id, pageable).isEmpty()) {
            throw new DiagnosesNotFoundException("Diagnoses of Doctor id : " + id + " not found");
        }
        return diagnosesRepository.findByDoctorId(id, pageable).map(this::toDTO);
    }

    @Override
    public DiagnosesEntity toEntity(DiagnosesDTOResponse dto) {
        return null;
    }

    @Override
    public DiagnosesDTOResponse toDTO(DiagnosesEntity entity) {
        if (entity == null) {
            throw new IllegalArgumentException("DiagnosesEntity cannot be null");
        }
        
        // Validar que las relaciones necesarias estén presentes
        if (entity.getDoctor() == null) {
            throw new RuntimeException("Diagnosis entity must have a doctor");
        }
        if (entity.getPet() == null) {
            throw new RuntimeException("Diagnosis entity must have a pet");
        }
        if (entity.getAppointment() == null) {
            throw new RuntimeException("Diagnosis entity must have an appointment");
        }
        
        return DiagnosesDTOResponse.builder()
                .diagnose(entity.getDiagnose())
                .treatment(entity.getTreatment())
                .doctorName(entity.getDoctor().getName() + " " + entity.getDoctor().getSurname())
                .petName(entity.getPet().getName())
                .petType(entity.getPet().getPetType())
                .otherType(entity.getPet().getOtherType())
                .appointmentReason(entity.getAppointment().getReason())
                .date(entity.getDate())
                .build();
    }


}
