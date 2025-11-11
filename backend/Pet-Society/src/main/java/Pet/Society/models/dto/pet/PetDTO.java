package Pet.Society.models.dto.pet;

import Pet.Society.models.enums.PetType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@AllArgsConstructor
@Data
@SuperBuilder

public class PetDTO {
    private Long id;
    @NotNull
    private String name;
    @Positive
    private int age;
    private boolean active = true;
    @NotNull(message = "El tipo de animal no puede ser nulo")
    private PetType petType;
    @Size(max = 50, message = "El tipo de animal personalizado no puede exceder 50 caracteres")
    private String otherType;
    @NotNull
    private Long clientId;


}
