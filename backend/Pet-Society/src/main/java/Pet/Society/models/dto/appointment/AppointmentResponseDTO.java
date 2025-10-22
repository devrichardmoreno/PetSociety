package Pet.Society.models.dto.appointment;

import Pet.Society.models.entities.DoctorEntity;
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
public class AppointmentResponseDTO {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String doctorName;
    private String petName;
    private Reason reason;
    private boolean aproved;
    private Status status;
}
