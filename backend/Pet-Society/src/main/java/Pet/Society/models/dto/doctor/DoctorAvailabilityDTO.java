package Pet.Society.models.dto.doctor;

import Pet.Society.models.enums.Reason;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder

public class DoctorAvailabilityDTO {
    private LocalDateTime start;
    private LocalDateTime end;
    private Reason reason;
}
