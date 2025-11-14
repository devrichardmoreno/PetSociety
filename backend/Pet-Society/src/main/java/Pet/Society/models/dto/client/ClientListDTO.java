package Pet.Society.models.dto.client;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientListDTO {
    private Long id;
    private String name;
    private String surname;
    private String dni;
    private String phone;
    private String email;
    private Integer petsCount;
}

