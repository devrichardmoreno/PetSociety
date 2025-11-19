import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from '../../../../services/doctor/doctor.service';
import { Doctor } from '../../../../models/entities/doctor';
import { Speciality } from '../../../../models/enums/speciality.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-doctor-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-list.html',
  styleUrls: ['./doctor-list.css']
})
export class DoctorListComponent implements OnInit {

  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  searchTerm: string = '';

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
        this.filteredDoctors = this.doctors;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener doctores:', error);
        this.errorMessage = 'No se pudieron cargar los doctores.';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredDoctors = this.doctors;
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    const searchWords = search.split(/\s+/);

    this.filteredDoctors = this.doctors.filter(doctor => {
      const fullName = `${doctor.name} ${doctor.surname}`.toLowerCase();
      const reverseFullName = `${doctor.surname} ${doctor.name}`.toLowerCase();
      const name = doctor.name?.toLowerCase() || '';
      const surname = doctor.surname?.toLowerCase() || '';

      // Si hay una sola palabra, buscar en nombre o apellido
      if (searchWords.length === 1) {
        return name.includes(search) || surname.includes(search);
      }

      // Si hay múltiples palabras, buscar nombre + apellido o apellido + nombre
      const searchPhrase = searchWords.join(' ');
      return fullName.includes(searchPhrase) || reverseFullName.includes(searchPhrase);
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
    if (!doctor.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el ID del doctor',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    const doctorName = `${doctor.name} ${doctor.surname}`;

    // Primera confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas dar de baja al doctor ${doctorName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#f57c00',
      cancelButtonColor: '#45AEDD',
      iconColor: '#f57c00',
      reverseButtons: false
    }).then((firstResult) => {
      if (firstResult.isConfirmed) {
        // Segunda confirmación con botones invertidos
        Swal.fire({
          title: '¿Realmente estás seguro?',
          text: `Esta acción dará de baja al doctor ${doctorName}. ¿Confirmas esta acción?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#f57c00',
          cancelButtonColor: '#45AEDD',
          iconColor: '#f57c00',
          reverseButtons: true
        }).then((secondResult) => {
          // Con reverseButtons: true, los botones están invertidos visualmente
          // pero la lógica sigue igual: confirmButton confirma, cancelButton cancela
          // El usuario debe presionar "Sí" (confirmButton) para confirmar
          if (secondResult.isConfirmed) {
            // El usuario presionó "Sí" en la segunda pregunta
            this.performUnsubscribe(doctor.id!);
          }
        });
      }
    });
  }

  private performUnsubscribe(doctorId: number): void {
    this.doctorService.unsubscribeDoctor(doctorId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Doctor dado de baja',
          text: 'El doctor ha sido dado de baja exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
        // Recargar la lista de doctores
        this.loadDoctors();
      },
      error: (error) => {
        console.error('Error al dar de baja al doctor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo dar de baja al doctor. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    });
  }
}

