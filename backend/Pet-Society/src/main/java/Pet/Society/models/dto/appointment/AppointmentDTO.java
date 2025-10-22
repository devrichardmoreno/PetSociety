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
public class AppointmentDTO {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Status status;
    private long doctor;
    private Reason reason;
    private Boolean aproved;
}
