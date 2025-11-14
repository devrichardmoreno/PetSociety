package Pet.Society.models.dto.register;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
public class RegisterClientDTO extends RegisterDTO {
    @NotNull
    private Boolean foundation;
}

