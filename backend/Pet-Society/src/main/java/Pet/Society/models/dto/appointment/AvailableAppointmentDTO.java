package Pet.Society.models.dto.appointment;

import Pet.Society.models.enums.Reason;
import Pet.Society.models.enums.Speciality;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
public class AvailableAppointmentDTO {
    private Long appointmentId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String doctorName;
    private Long doctorId;
    private Speciality doctorSpeciality;
    private Reason reason;
}

