package Pet.Society.models.dto.appointment;

import Pet.Society.models.enums.Reason;
import Pet.Society.models.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
public class AppointmentUpdateDTO {
    private Reason reason;
    private Status status;
    private Long petId;
    private Long diagnosesId;
    private Boolean approved;

}
