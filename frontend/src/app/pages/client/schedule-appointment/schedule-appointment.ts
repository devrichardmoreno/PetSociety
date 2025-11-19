import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { Reason } from '../../../models/enums/reason.enum';
import { AvailableAppointmentDTO } from '../../../models/dto/appointment/available-appointment-dto';
import { Speciality } from '../../../models/enums/speciality.enum';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-schedule-appointment',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './schedule-appointment.html',
  styleUrl: './schedule-appointment.css'
})
export class ScheduleAppointmentComponent implements OnInit {
  @Input() petId!: number;
  @Output() appointmentScheduled = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  // Estados del wizard
  currentStep: number = 1;
  totalSteps: number = 4;

  // Paso 1: Motivo
  selectedReason: Reason | null = null;
  reasonOptions = [
    { value: Reason.CONTROL, label: 'Control' },
    { value: Reason.EMERGENCY, label: 'Emergencia' },
    { value: Reason.VACCINATION, label: 'Vacunación' },
    { value: Reason.NUTRITION, label: 'Nutrición' }
  ];

  // Paso 2: Calendario
  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  selectedDate: Date | null = null;
  availableDays: string[] = []; // Fechas en formato YYYY-MM-DD

  // Paso 3: Horarios
  availableAppointments: AvailableAppointmentDTO[] = [];
  selectedAppointment: AvailableAppointmentDTO | null = null;

  // Paso 4: Confirmación
  isLoading: boolean = false;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    // No cargar nada hasta que se seleccione un motivo
  }

  // Paso 1: Seleccionar motivo
  selectReason(reason: Reason): void {
    this.selectedReason = reason;
    this.loadAvailableDays();
    this.nextStep();
  }

  loadAvailableDays(): void {
    if (!this.selectedReason) return;
    
    this.isLoading = true;
    this.appointmentService.getAvailableDaysByReason(this.selectedReason).subscribe({
      next: (days) => {
        this.availableDays = days;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar días disponibles:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los días disponibles',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  // Paso 2: Calendario
  getDaysInMonth(): number[] {
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }

  getFirstDayOfMonth(): number {
    return new Date(this.currentYear, this.currentMonth, 1).getDay();
  }

  isDateAvailable(day: number): boolean {
    const date = new Date(this.currentYear, this.currentMonth, day);
    const dateString = this.formatDate(date);
    return this.availableDays.includes(dateString);
  }

  isDateSelected(day: number): boolean {
    if (!this.selectedDate) return false;
    return this.selectedDate.getDate() === day &&
           this.selectedDate.getMonth() === this.currentMonth &&
           this.selectedDate.getFullYear() === this.currentYear;
  }

  isDatePast(day: number): boolean {
    const date = new Date(this.currentYear, this.currentMonth, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  selectDay(day: number): void {
    if (this.isDatePast(day) || !this.isDateAvailable(day)) return;
    
    this.selectedDate = new Date(this.currentYear, this.currentMonth, day);
    this.loadAvailableAppointmentsForDate();
    this.nextStep();
  }

  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  getMonthName(): string {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[this.currentMonth];
  }

  // Paso 3: Cargar horarios del día seleccionado
  loadAvailableAppointmentsForDate(): void {
    if (!this.selectedReason || !this.selectedDate) return;

    const dateString = this.formatDate(this.selectedDate);
    this.isLoading = true;

    this.appointmentService.getAvailableAppointmentsByReasonAndDate(this.selectedReason, dateString).subscribe({
      next: (appointments) => {
        this.availableAppointments = appointments;
        this.isLoading = false;
        
        if (appointments.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin disponibilidad',
            text: 'No hay horarios disponibles para este día',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#45AEDD'
          });
          this.previousStep();
        }
      },
      error: (error) => {
        console.error('Error al cargar horarios:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los horarios disponibles',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  selectAppointment(appointment: AvailableAppointmentDTO): void {
    this.selectedAppointment = appointment;
    this.nextStep();
  }

  getSpecialityLabel(speciality: Speciality): string {
    const labels: { [key in Speciality]: string } = {
      [Speciality.GENERAL_MEDICINE]: 'Medicina General',
      [Speciality.INTERNAL_MEDICINE]: 'Medicina Interna',
      [Speciality.NUTRITION]: 'Nutrición'
    };
    return labels[speciality] || speciality;
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForDisplay(date: Date): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${days[date.getDay()]}, ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
  }

  // Paso 4: Confirmar cita
  confirmAppointment(): void {
    if (!this.selectedAppointment) return;

    this.isLoading = true;
    this.appointmentService.assignAppointment(this.selectedAppointment.appointmentId, this.petId).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: '¡Cita agendada!',
          text: 'Tu cita ha sido agendada exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#7AC143'
        }).then(() => {
          this.appointmentScheduled.emit();
        });
      },
      error: (error) => {
        console.error('Error al agendar cita:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo agendar la cita. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  // Navegación del wizard
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      
      // Resetear selecciones según el paso
      if (this.currentStep === 2) {
        this.selectedDate = null;
        this.availableAppointments = [];
        this.selectedAppointment = null;
      } else if (this.currentStep === 3) {
        this.selectedAppointment = null;
      }
    }
  }

  cancelSchedule(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se perderán todos los datos ingresados',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, continuar',
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#45AEDD'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cancel.emit();
      }
    });
  }

  getReasonLabel(reason: Reason): string {
    const option = this.reasonOptions.find(opt => opt.value === reason);
    return option ? option.label : reason;
  }
}

