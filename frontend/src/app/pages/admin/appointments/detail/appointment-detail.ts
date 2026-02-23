import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AppointmentService } from '../../../../services/appointment/appointment.service';
import { AppointmentResponseDTO } from '../../../../models/dto/appointment/appointment-response-dto';
import { CommonModule } from '@angular/common';
import { Status } from '../../../../models/enums/status.enum';
import { Reason } from '../../../../models/enums/reason.enum';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../../utils/error-handler';

@Component({
  selector: 'app-appointment-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './appointment-detail.html',
  styleUrls: ['./appointment-detail.css']
})
export class AppointmentDetail implements OnInit {
  
  appointment: AppointmentResponseDTO | null = null;

  constructor(
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private router: Router,
    private location: Location
  ) { }

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      this.appointmentService.getAppointmentById(+appointmentId).subscribe(
        (data: AppointmentResponseDTO) => {
          this.appointment = data;
        },
        (error: any) => {
          console.error('Error fetching appointment:', error);
        }
      );
    }
  }

  approveAppointment(): void {
    if (this.appointment) {
      console.log('Intentando aprobar cita con ID:', this.appointment.id);
      this.appointmentService.approveAppointment(this.appointment.id).subscribe({
        next: (updatedAppointment) => {
          console.log('Respuesta exitosa:', updatedAppointment);
          this.appointment = updatedAppointment;
          Swal.fire({
            icon: 'success',
            title: '¡Cita marcada como pagada!',
            text: 'El estado de pago se actualizó correctamente',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#66bb6a',
            iconColor: '#66bb6a',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.location.back();
          });
        },
        error: (error: any) => {
          const errorMessage = getFriendlyErrorMessage(error);
          
          Swal.fire({
            icon: 'error',
            title: 'Error al marcar como pagada',
            text: errorMessage,
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#f57c00',
            iconColor: '#f44336'
          });
        }
      });
    }
  }

  disapproveAppointment(): void {
    if (this.appointment) {
      console.log('Intentando desaprobar cita con ID:', this.appointment.id);
      this.appointmentService.disapproveAppointment(this.appointment.id).subscribe({
        next: (updatedAppointment: AppointmentResponseDTO) => {
          console.log('Respuesta exitosa:', updatedAppointment);
          this.appointment = updatedAppointment;
          Swal.fire({
            icon: 'success',
            title: 'Cita marcada como no pagada',
            text: 'El estado de pago se actualizó correctamente',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#f57c00',
            iconColor: '#f44336',
            timer: 2000,
            showConfirmButton: false
          }).then(() => {
            this.location.back();
          });
        },
        error: (error: any) => {
          const errorMessage = getFriendlyErrorMessage(error);
          
          Swal.fire({
            icon: 'error',
            title: 'Error al marcar como no pagada',
            text: errorMessage,
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#f57c00',
            iconColor: '#f44336'
          });
        }
      });
    }
  }

  getStatusLabel(status: Status): string {
    const labels: { [key in Status]: string } = {
      [Status.CANCELED]: 'Cancelada',
      [Status.RESCHEDULED]: 'Reprogramada',
      [Status.SUCCESSFULLY]: 'Completada',
      [Status.TO_BEGIN]: 'Por comenzar',
      [Status.AVAILABLE]: 'Disponible'
    };
    return labels[status] || status;
  }

  getReasonLabel(reason: Reason): string {
    const labels: { [key in Reason]: string } = {
      [Reason.CONTROL]: 'Control',
      [Reason.EMERGENCY]: 'Emergencia',
      [Reason.VACCINATION]: 'Vacunación',
      [Reason.NUTRITION]: 'Nutrición'
    };
    return labels[reason] || reason;
  }

  goBack(): void {
    this.location.back();
  }
}
