package Pet.Society.models.dto.client;

import Pet.Society.models.dto.pet.PetDTO;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.List;

@AllArgsConstructor
@Data
@NoArgsConstructor
@SuperBuilder

public class ClientDTO {
    private String name;
    private String surname;
    private String dni;
    private String phone;
    private String email;
    private List<PetDTO> pets;
}
