package Pet.Society.models.entities;

import Pet.Society.models.enums.PetType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.ColumnDefault;

@Entity
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class PetEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true, nullable = false, name = "pet_id")
    private long id;
    @NotNull(message = "El nombre no puede ser nulo")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s-]+$", message = "El nombre solo puede contener letras, espacios, ñ y tildes")
    private String name;
    @Min(value = 1, message = "La edad debe ser al menos 1")
    @Max(value = 30, message = "La edad no puede superar 30 años")
    private int age;
    @ColumnDefault("1")
    private boolean active = true;
    @NotNull(message = "El tipo de animal no puede ser nulo")
    @Enumerated(EnumType.STRING)
    @Column(name = "pet_type", nullable = false)
    private PetType petType;
    @Size(max = 50, message = "El tipo de animal personalizado no puede exceder 50 caracteres")
    @Column(name = "other_type", length = 50)
    private String otherType;
    @ManyToOne
    @JoinColumn(name = "id_cliente")
    @NotNull(message = "La id_cliente no puede ser nula")
    private ClientEntity client;
}
