import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment-service';
import { DoctorService } from '../../../services/doctor-service';
import { AppointmentDTORequest } from '../../../models/dto/appointment-dto-request';
import { Reason } from '../../../models/dto/reason.enum';
import { Doctor } from '../../../models/doctor';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-appointment',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-appointment.html',
  styleUrls: ['./create-appointment.css'],
  standalone: true
})
export class CreateAppointment implements OnInit {

  appointmentForm!: FormGroup;

  reasonOptions = [
    { value: Reason.CONTROL, label: 'Control' },
    { value: Reason.EMERGENCY, label: 'Emergencia' },
    { value: Reason.VACCINATION, label: 'Vacunación' },
    { value: Reason.NUTRITION, label: 'Nutrición' }
  ];

  doctors: Doctor[] = [];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      startTime: [null, [Validators.required, this.futureDateValidator]],
      endTime: [null, [Validators.required]],
      doctor: [null, Validators.required],
      reason: [null, Validators.required]
    }, { validators: this.endAfterStartValidator });

    this.doctorService.getAllDoctorsEntity().subscribe({
      next: (doctors) => this.doctors = doctors,
      error: (err) => console.error('Error al cargar doctores:', err)
    });
  }

  futureDateValidator(control: AbstractControl): ValidationErrors | null {
    const selected = new Date(control.value);
    const now = new Date();
    if (control.value && selected < now) {
      return { pastDate: true };
    }
    return null;
  }

  endAfterStartValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    if (start && end && new Date(end) <= new Date(start)) {
      return { endBeforeStart: true };
    }
    return null;
  }

  onSubmit(): void {

    console.log(this.appointmentForm.value);
    if (this.appointmentForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completá todos los campos requeridos.',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#F47B20',
        iconColor: '#000000'
      });
      return;
    }

    Swal.fire({
      title: '¿Confirmar cita?',
      text: '¿Deseás agendar esta cita con los datos ingresados?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, agendar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F47B20',
      cancelButtonColor: '#6c757d',
      background: '#fff',
      color: '#333'
    }).then((result) => {
      if (result.isConfirmed) {
        const formValue = this.appointmentForm.value;
        const appointmentData: AppointmentDTORequest = {
          ...formValue,
          doctor: formValue.doctor.id
        };

        this.appointmentService.createAppointment(appointmentData).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Cita agendada!',
              text: 'La cita fue creada exitosamente 💙🐾',
              background: '#fff',
              color: '#333',
              confirmButtonText: 'Volver al inicio',
              confirmButtonColor: '#F47B20',
              iconColor: '#7AC143',
              customClass: { popup: 'animate__animated animate__fadeInDown' }
            }).then(() => {
              this.router.navigate(['/admin/home']);
            });
          },
          error: (e) => {
            console.error( e);
            Swal.fire({
              icon: 'error',
              title: 'Error al agendar',
              text: `Ocurrió un problema: ${e.message|| 'Error desconocido'}`,
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#F47B20',
              iconColor: '#000000'
            });
          }
        });
      }
    });
  }
}
