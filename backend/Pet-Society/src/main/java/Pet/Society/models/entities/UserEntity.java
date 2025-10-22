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
    @NotNull
    @Size(min = 2, max = 50, message = "Error on name")
    private String name;
    @NotNull
    @Size(min = 2, max = 50, message = "Error on surname")
    private String surname;
    @NotNull
    @Size(min = 9, max = 20, message = "Error on phone")
    private String phone;
    @NotNull
    @Size(min = 7, max = 8, message = "Error on dni")
    @Column(unique = true)
    private String dni;
    @NotNull
    @Email
    @Column(unique = true)
    private String email;
    @NotNull
    @ColumnDefault("true")
    private Boolean subscribed = true;





}
