import { Component, OnInit } from '@angular/core';
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

  constructor(private doctorService: DoctorService) {}

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
    this.doctorService.getAllDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
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
    // TODO: Implementar edición de doctor
    console.log('Editar doctor:', doctor);
  }

  deleteDoctor(doctor: Doctor): void {
    // TODO: Implementar dar de baja de doctor
    console.log('Dar de baja doctor:', doctor);
  }
}
