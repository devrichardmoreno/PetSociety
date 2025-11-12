import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Speciality } from '../../models/dto/speciality.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-doctor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './create-doctor.html',
  styleUrls: ['./create-doctor.css'],
})
export class CreateDoctor implements OnInit {

  doctorForm!: FormGroup;
  specialities = Object.values(Speciality);

  private apiUrl = 'http://localhost:8080/register/new/doctor';

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    this.doctorForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dni: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8)]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      speciality: [null, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos requeridos',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#F47B20',
        iconColor: '#000000'
      });
      this.doctorForm.markAllAsTouched();
      return;
    }

    const newDoctor = this.doctorForm.value;

    this.http.post(this.apiUrl, newDoctor, { responseType: 'text' })
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '✅ Doctor registrado con éxito',
            text: 'El nuevo doctor fue agregado correctamente.',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20',
            iconColor: '#7AC143'
          });
          this.doctorForm.reset();
        },
        error: (error) => {
          console.error('❌ Error al registrar el doctor:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error al registrar el doctor',
            text: `Ocurrió un problema: ${error.message || error.statusText || 'Error desconocido'}`,
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20',
            iconColor: '#000000'
          });
        }
      });
  }
}
