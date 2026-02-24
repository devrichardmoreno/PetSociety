package Pet.Society.models.dto.client;

import Pet.Society.models.dto.pet.PetDTO;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@AllArgsConstructor
@Data
@NoArgsConstructor
@SuperBuilder
public class ClientDTO {
    @NotNull(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s-]+$", message = "El nombre solo puede contener letras, espacios, ñ y tildes")
    private String name;
    @NotNull(message = "El apellido es obligatorio")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s-]+$", message = "El apellido solo puede contener letras, espacios, ñ y tildes")
    private String surname;
    @NotNull(message = "El DNI es obligatorio")
    @Size(min = 7, max = 8, message = "El DNI debe tener 7 u 8 dígitos")
    @Pattern(regexp = "^\\d{7,8}$", message = "El DNI solo puede contener números")
    private String dni;
    @NotNull(message = "El teléfono es obligatorio")
    @Size(min = 9, max = 20, message = "El teléfono debe tener entre 9 y 20 caracteres")
    @Pattern(regexp = "^\\d{9,20}$", message = "El teléfono solo puede contener números")
    private String phone;
    @NotNull(message = "El email es obligatorio")
    @Email(message = "El email debe tener un formato válido")
    private String email;
    private List<PetDTO> pets;
}
