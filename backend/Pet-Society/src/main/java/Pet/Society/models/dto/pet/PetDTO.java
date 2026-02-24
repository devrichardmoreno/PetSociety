package Pet.Society.models.dto.pet;

import Pet.Society.models.enums.PetType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
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
    @NotNull(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s-]+$", message = "El nombre solo puede contener letras, espacios, ñ y tildes")
    private String name;
    @Min(value = 1, message = "La edad debe ser al menos 1")
    @Max(value = 30, message = "La edad no puede superar 30 años")
    private int age;
    private boolean active = true;
    @NotNull(message = "El tipo de animal no puede ser nulo")
    private PetType petType;
    @Size(max = 50, message = "El tipo de animal personalizado no puede exceder 50 caracteres")
    private String otherType;
    @NotNull
    private Long clientId;


}
