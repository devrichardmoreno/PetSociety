package Pet.Society.models.entities;

import Pet.Society.models.enums.Reason;
import Pet.Society.models.enums.Status;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
@Entity
@Table(name = "appointments")
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class AppointmentEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Reason reason;
    private Status status;
    @ManyToOne
    private DoctorEntity doctor;
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "diagnoses_id")
    private DiagnosesEntity diagnoses;
    @ManyToOne
    private PetEntity pet;
    private boolean approved;


}
