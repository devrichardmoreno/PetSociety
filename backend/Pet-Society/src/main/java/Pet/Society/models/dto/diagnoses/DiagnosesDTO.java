package Pet.Society.models.dto.diagnoses;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
public class DiagnosesDTO {

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9 ]+$")
    private String diagnose;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9 ]+$")
    private String treatment;

    @NotNull
    private Long appointmentId;

    @NotNull
    @PastOrPresent
    private LocalDateTime date;


}
