package Pet.Society.models.dto.appointment;

import Pet.Society.models.enums.Reason;
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
public class AppointmentScheduleDTO {
    private LocalDateTime startTime;
    private String doctorName;
    private String clientName;
    private String petName;
    private Reason reason;
}
