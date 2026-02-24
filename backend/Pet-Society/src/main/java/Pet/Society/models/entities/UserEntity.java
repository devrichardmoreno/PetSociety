package Pet.Society.models.entities;


import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;

import java.util.List;

@Entity
@SuperBuilder
@Inheritance(strategy = InheritanceType.JOINED)
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor


public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @NotNull(message = "El nombre es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s-]+$", message = "El nombre solo puede contener letras, espacios, ñ y tildes")
    private String name;
    @NotNull(message = "El apellido es obligatorio")
    @Size(min = 2, max = 50, message = "El apellido debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s-]+$", message = "El apellido solo puede contener letras, espacios, ñ y tildes")
    private String surname;
    @NotNull(message = "El teléfono es obligatorio")
    @Size(min = 9, max = 20, message = "El teléfono debe tener entre 9 y 20 caracteres")
    @Pattern(regexp = "^\\d{9,20}$", message = "El teléfono solo puede contener números")
    private String phone;
    @NotNull(message = "El DNI es obligatorio")
    @Size(min = 7, max = 8, message = "El DNI debe tener 7 u 8 dígitos")
    @Pattern(regexp = "^\\d{7,8}$", message = "El DNI solo puede contener números")
    @Column(unique = true)
    private String dni;
    @NotNull
    @Email
    @Column(unique = true)
    private String email;
    @NotNull
    @ColumnDefault("true")
    private Boolean subscribed = true;
    @ColumnDefault("false")
    private Boolean emailVerified = false;





}
