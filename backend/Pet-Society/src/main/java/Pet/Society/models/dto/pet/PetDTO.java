package Pet.Society.models.dto.pet;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@NoArgsConstructor
@AllArgsConstructor
@Data
@SuperBuilder

public class PetDTO {
    @NotNull
    private String name;
    @Positive
    private int age;
    private boolean active = true;
    @NotNull
    private Long clientId;


}
