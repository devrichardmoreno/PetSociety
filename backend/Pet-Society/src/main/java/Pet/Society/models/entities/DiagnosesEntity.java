package Pet.Society.models.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Entity
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class DiagnosesEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @Lob //indica que es un Character Large Object para que lo pase como tipo TEXT
    private String diagnose;
    @Lob
    private String treatment;
    @ManyToOne
    private DoctorEntity doctor;
    @ManyToOne
    private PetEntity pet;
    @OneToOne
    private AppointmentEntity appointment;
    private LocalDateTime date;



}
