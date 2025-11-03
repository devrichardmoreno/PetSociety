import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment-service';
import { DoctorService } from '../../../services/doctor-service';
import { AppointmentDTORequest } from '../../../models/dto/appointment-dto-request';
import { Reason } from '../../../models/dto/reason.enum';
import { Doctor } from '../../../models/doctor';

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
    { value: Reason.VACCINATION, label: 'Vacunacion' },
    { value: Reason.NUTRITION, label: 'Nutricion' }
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

    // Cargar todos los doctores
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
    if (this.appointmentForm.invalid) {
      this.appointmentForm.markAllAsTouched();
      console.warn('Formulario inválido. Por favor, revisa los campos.');
      return;
    }

    const formValue = this.appointmentForm.value;

    const appointmentData: AppointmentDTORequest = {
      ...formValue,
      doctor: formValue.doctor.id  // Tomamos solo el ID del doctor
    };

    // Aquí NO necesitamos pasar token, el interceptor lo hace automáticamente
    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        console.log('Cita creada con éxito:', response);
        alert('Cita agendada correctamente.');
        this.router.navigate(['/admin/home']);
      },
      error: (e) => {
        console.error('Error al crear la cita:', e);
        alert('Hubo un error al agendar la cita. Inténtalo de nuevo.');
      }
    });
  }
}
