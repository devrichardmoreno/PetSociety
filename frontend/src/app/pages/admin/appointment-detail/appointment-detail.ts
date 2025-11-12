import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AppointmentService } from '../../../services/appointment-service';
import { AppointmentResponseDTO } from '../../../models/dto/appointment-response-dto';
import { CommonModule } from '@angular/common';

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
    private appointmentService: AppointmentService
  ) { }

  ngOnInit(): void {
    const appointmentId = this.route.snapshot.paramMap.get('id');
    if (appointmentId) {
      this.appointmentService.getAppointmentById(+appointmentId).subscribe(
        (data) => {
          this.appointment = data;
        },
        (error) => {
          console.error('Error fetching appointment:', error);
        }
      );
    }
  }

  approveAppointment(): void {
    if (this.appointment) {
      this.appointmentService.approveAppointment(this.appointment.id).subscribe(
        () => {
          this.appointment!.aproved = true;
        },
        (error) => {
          console.error('Error approving appointment:', error);
        }
      );
    }
  }

  disapproveAppointment(): void {
    if (this.appointment) {
      this.appointmentService.disapproveAppointment(this.appointment.id).subscribe(
        () => {
          this.appointment!.aproved = false;
        },
        (error) => {
          console.error('Error disapproving appointment:', error);
        }
      );
    }
  }
}
