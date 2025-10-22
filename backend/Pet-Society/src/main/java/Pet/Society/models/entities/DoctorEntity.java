package Pet.Society.models.entities;

import Pet.Society.models.enums.Speciality;
import jakarta.persistence.Entity;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@AllArgsConstructor
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@Table(name="doctors")
public class DoctorEntity extends UserEntity{
    @Enumerated
    private Speciality speciality;



}
