package Pet.Society.models.dto.appointment;

import Pet.Society.models.enums.Reason;
import Pet.Society.models.enums.Speciality;
import Pet.Society.models.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
public class AppointmentHistoryDTO {
    private Long appointmentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String doctorName;
    private Long doctorId;
    private Speciality doctorSpeciality;
    private String clientName;
    private String petName;
    private Long petId;
    private Reason reason;
    private Status status;
    private boolean hasDiagnosis;
    private Long diagnosisId; // Para poder obtener el diagnóstico después si es necesario
}

