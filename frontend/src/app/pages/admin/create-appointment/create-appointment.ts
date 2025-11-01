import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { Router } from '@angular/router';
import { AppointmentService } from '../../../services/appointment-service';
import { AppointmentDTORequest } from '../../../models/dto/appointment-dto-request';
import { Reason } from '../../../models/dto/reason.enum';

@Component({
  selector: 'app-create-appointment',
  imports: [ReactiveFormsModule, CommonModule], 
  templateUrl: './create-appointment.html',
  styleUrl: './create-appointment.css',
  standalone: true 
})
export class CreateAppointment implements OnInit { 
  
  appointmentForm!: FormGroup;

  reasonOptions = [
    { value: Reason.CHECKUP, label: 'Chequeo' },
    { value: Reason.VACCINATION, label: 'Vacunación' },
    { value: Reason.SURGERY, label: 'Cirugía' }
  ];

  doctors = [
    { id: 1, name: 'Dr. Richard Moreno' },
    { id: 2, name: 'Dr. German Oviedo' },
    { id: 3, name: 'Dr. Manuel Llopart' }
  ];

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.appointmentForm = this.fb.group({
      startTime: [null, [Validators.required, this.futureDateValidator]],
      endTime: [null, [Validators.required]],
      doctor: [null, Validators.required],
      reason: [null, Validators.required]
    }, { validators: this.endAfterStartValidator });
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

    const appointmentData: AppointmentDTORequest = this.appointmentForm.value;

    this.appointmentService.createAppointment(appointmentData).subscribe({
      next: (response) => {
        console.log('Cita creada con éxito:', response);
        alert('Cita agendada correctamente.');
        this.router.navigate(['/appointments/list']);       
      },
      error: (err) => {
        console.error('Error al crear la cita:', err);
        alert('Hubo un error al agendar la cita. Inténtalo de nuevo.');
      }
    });
  }
}
