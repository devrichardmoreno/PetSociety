package Pet.Society.models.dto.doctor;

import Pet.Society.models.enums.Speciality;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDTO {
    private String name;
    private String surname;
    private String  dni;
    private String phone;
    private String email;
    private Speciality speciality;
}
