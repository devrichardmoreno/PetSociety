package Pet.Society.models.dto.doctor;

import Pet.Society.models.enums.Speciality;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@AllArgsConstructor
@NoArgsConstructor
@Data
@SuperBuilder
public class DoctorRequest {
    @NotNull
    private String username;
    @NotNull
    @Size(min = 2,max = 50,message = "The password is incorrect form")
    private String password;
    @NotNull
    @Size(min = 2, max = 50, message = "Error en nombre")
    private String name;
    @NotNull
    @Size(min = 2, max = 50, message = "Error en apellido")
    private String surname;
    @NotNull
    @Size(min = 9, max = 20, message = "Error at phone")
    private String phone;
    @NotNull
    @Size(min = 7, max = 8, message = "Error in t")
    private String dni;
    @Email
    @NotNull
    private String email;
    @NotNull
    private Speciality speciality;

}
