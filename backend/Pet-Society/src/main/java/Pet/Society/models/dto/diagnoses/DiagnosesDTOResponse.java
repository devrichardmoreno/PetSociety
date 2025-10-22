package Pet.Society.models.dto.diagnoses;

import Pet.Society.models.entities.DiagnosesEntity;
import Pet.Society.models.enums.Reason;
import Pet.Society.models.interfaces.Mapper;
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
public class DiagnosesDTOResponse {


    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9 ]+$")
    private String diagnose;

    @NotBlank
    @Pattern(regexp = "^[A-Za-z0-9 ]+$")
    private String treatment;

    @NotNull
    private String doctorName;

    @NotNull
    private String petName;

    @NotNull
    private Reason appointmentReason;

    @NotNull
    @PastOrPresent
    private LocalDateTime date;





}
