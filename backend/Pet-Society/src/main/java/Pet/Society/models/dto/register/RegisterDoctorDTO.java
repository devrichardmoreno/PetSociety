package Pet.Society.models.dto.register;

import Pet.Society.models.enums.Speciality;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class RegisterDoctorDTO extends RegisterDTO{
    @NotNull
    @Enumerated(EnumType.STRING)
    private Speciality speciality;

}
