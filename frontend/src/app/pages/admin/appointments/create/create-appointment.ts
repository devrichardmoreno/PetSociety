import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AppointmentService } from '../../../../services/appointment/appointment.service';
import { DoctorService } from '../../../../services/doctor/doctor.service';
import { AppointmentDTORequest } from '../../../../models/dto/appointment/appointment-dto-request';
import { Reason } from '../../../../models/enums/reason.enum';
import { Doctor } from '../../../../models/entities/doctor';
import { DoctorAvailabilityDTO } from '../../../../models/dto/appointment/doctor-availability-dto';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../../utils/error-handler';

@Component({
  selector: 'app-create-appointment',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './create-appointment.html',
  styleUrls: ['./create-appointment.css'],
  standalone: true
})
export class CreateAppointment implements OnInit {

   appointmentForm!: FormGroup;
  appointmentBulkForm!: FormGroup;
  isMultipleMode = false; // 🔁 Nuevo switch

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


    this.appointmentBulkForm = this.fb.group({
      doctor: [null, Validators.required],
      startDate: [null, [Validators.required, this.futureDateValidator]],
      endDate: [null, [Validators.required]],
      reason: [null, Validators.required],
      minHour: ['08:00', [Validators.required]],
      maxHour: ['16:00', [Validators.required]]
    }, { validators: [this.endAfterStartValidator, this.timeRangeValidator] });

    this.doctorService.getAllDoctorsEntity().subscribe({
      next: (doctors: Doctor[]) => this.doctors = doctors,
      error: (err: any) => console.error('Error al cargar doctores:', err)
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
    const start = group.get('startTime')?.value || group.get('startDate')?.value;
    const end = group.get('endTime')?.value || group.get('endDate')?.value;
    if (start && end && new Date(end) <= new Date(start)) {
      return { endBeforeStart: true };
    }
    return null;
  }

  timeRangeValidator(group: AbstractControl): ValidationErrors | null {
    const minHourStr = group.get('minHour')?.value;
    const maxHourStr = group.get('maxHour')?.value;
    
    if (minHourStr && maxHourStr) {
      // Convertir formato "HH:mm" a minutos para comparar
      const parseTimeToMinutes = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const minMinutes = parseTimeToMinutes(minHourStr);
      const maxMinutes = parseTimeToMinutes(maxHourStr);
      
      if (minMinutes >= maxMinutes) {
        return { invalidTimeRange: true };
      }
    }
    return null;
  }

  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.appointmentForm.controls).forEach(key => {
      this.appointmentForm.get(key)?.markAsTouched();
    });

    if (this.appointmentForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completá todos los campos requeridos correctamente.',
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
            let errorTitle = 'Error al agendar';
            let errorMessage = getFriendlyErrorMessage(e);
            
            // Verificar si es un error de conflicto de horarios para personalizar el título
            if (e.status === 409 || e.error?.title === 'Duplicated Appointment' || 
                (e.error?.detail && (e.error.detail.includes('appointment') || e.error.detail.includes('hour')))) {
              errorTitle = 'Horario no disponible';
              // Si el mensaje genérico no es específico, crear uno personalizado
              if (!errorMessage.includes('doctor') && !errorMessage.includes('horario')) {
                const doctorName = formValue.doctor ? `${formValue.doctor.name} ${formValue.doctor.surname}` : 'el doctor seleccionado';
                const startTime = formValue.startTime ? new Date(formValue.startTime).toLocaleString('es-AR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'el horario seleccionado';
                errorMessage = `El doctor ${doctorName} ya tiene una cita programada para ${startTime}. Por favor, elegí otro horario disponible.`;
              }
            }
            
            Swal.fire({
              icon: 'error',
              title: errorTitle,
              text: errorMessage,
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#F47B20',
              iconColor: '#dc3545',
              confirmButtonText: 'Entendido'
            });
          }
        });
      }
    });
  }

  onSubmitBulk(): void {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.appointmentBulkForm.controls).forEach(key => {
      this.appointmentBulkForm.get(key)?.markAsTouched();
    });

    if (this.appointmentBulkForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completá todos los campos requeridos correctamente.',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#F47B20',
        iconColor: '#000000'
      });
      return;
    }

    Swal.fire({
      title: '¿Confirmar carga masiva?',
      text: 'Se crearán múltiples citas según el rango de fechas. ¿Continuar?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cargar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#F47B20'
    }).then((result) => {
      if (result.isConfirmed) {
        const { doctor, startDate, endDate, reason, minHour, maxHour } = this.appointmentBulkForm.value;

        // El input datetime-local devuelve un string en formato "YYYY-MM-DDTHH:mm"
        // Necesitamos convertirlo a formato ISO sin zona horaria para el backend
        // El backend espera LocalDateTime que no tiene zona horaria
        const formatToLocalISO = (dateTimeString: string): string => {
          // Si ya tiene segundos, mantenerlos; si no, agregar :00
          if (dateTimeString.includes(':')) {
            const parts = dateTimeString.split(':');
            if (parts.length === 2) {
              // Agregar segundos si no están
              return `${dateTimeString}:00`;
            }
          }
          return dateTimeString;
        };

       const payload: DoctorAvailabilityDTO = {
      start: formatToLocalISO(startDate),
      end: formatToLocalISO(endDate),
      reason,
      minHour: minHour || undefined, // El input type="time" ya devuelve formato "HH:mm"
      maxHour: maxHour || undefined
      };


        this.appointmentService.uploadDoctorAvailability(doctor.id, payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Citas creadas!',
              text: 'Las citas han sido generadas exitosamente.',
              confirmButtonColor: '#F47B20'
            }).then(() => this.router.navigate(['/admin/home']));
          },
          error: (err) => {
            let errorTitle = 'Error en la carga masiva';
            let errorMessage = getFriendlyErrorMessage(err);
            
            // Verificar si es un error de conflicto de horarios para personalizar el título
            if (err.status === 409 || err.error?.title === 'Duplicated Appointment' || 
                (err.error?.detail && (err.error.detail.includes('appointment') || err.error.detail.includes('hour')))) {
              errorTitle = 'Horarios no disponibles';
              // Si el mensaje genérico no es específico, crear uno personalizado
              if (!errorMessage.includes('doctor') && !errorMessage.includes('horario')) {
                const doctorName = this.appointmentBulkForm.value.doctor ? 
                  `${this.appointmentBulkForm.value.doctor.name} ${this.appointmentBulkForm.value.doctor.surname}` : 
                  'el doctor seleccionado';
                errorMessage = `El doctor ${doctorName} ya tiene citas programadas en algunos de los horarios del rango seleccionado. Por favor, elegí un rango de fechas diferente o revisá la disponibilidad del doctor.`;
              }
            }
            
            Swal.fire({
              icon: 'error',
              title: errorTitle,
              text: errorMessage,
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#F47B20',
              iconColor: '#dc3545',
              confirmButtonText: 'Entendido'
            });
          }
        });
      }
    });
  }
}
