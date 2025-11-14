import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DoctorService } from '../../services/doctor-service';
import { Doctor } from '../../models/doctor';
import { Speciality } from '../../models/dto/speciality.enum';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.html',
  styleUrls: ['./doctor-list.css']
})
export class DoctorListComponent implements OnInit {

  doctors: Doctor[] = [];
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private doctorService: DoctorService,
    private router: Router
  ) {}

  getSpecialityLabel(speciality: Speciality): string {
    const labels: { [key in Speciality]: string } = {
      [Speciality.GENERAL_MEDICINE]: 'Medicina General',
      [Speciality.INTERNAL_MEDICINE]: 'Medicina Interna',
      [Speciality.NUTRITION]: 'Nutrición'
    };
    return labels[speciality] || speciality;
  }

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    // Usar getAllDoctorsEntity para obtener los doctores con ID
    this.doctorService.getAllDoctorsEntity().subscribe({
      next: (data: any[]) => {
        // Mapear los datos para incluir el ID
        this.doctors = data.map((doctor: any) => ({
          id: doctor.id,
          name: doctor.name,
          surname: doctor.surname,
          dni: doctor.dni,
          phone: doctor.phone,
          email: doctor.email,
          speciality: doctor.speciality
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener doctores:', error);
        this.errorMessage = 'No se pudieron cargar los doctores.';
        this.loading = false;
      }
    });
  }

  editDoctor(doctor: Doctor): void {
    if (doctor.id) {
      this.router.navigate(['/register/new/doctor', doctor.id]);
    } else {
      console.error('No se pudo encontrar el ID del doctor');
    }
  }

  deleteDoctor(doctor: Doctor): void {
    // TODO: Implementar dar de baja de doctor
    console.log('Dar de baja doctor:', doctor);
  }
}
