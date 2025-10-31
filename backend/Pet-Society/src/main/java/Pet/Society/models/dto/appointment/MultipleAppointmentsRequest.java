package Pet.Society.models.dto.appointment;

import Pet.Society.models.enums.Reason;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class MultipleAppointmentsRequest {
    private Long doctorId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Reason reason;
}
