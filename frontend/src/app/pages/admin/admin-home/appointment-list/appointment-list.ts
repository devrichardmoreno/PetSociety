import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../services/appointment-service';
import { AppointmentResponseDTO } from '../../../../models/dto/appointment-response-dto';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.css'],
  standalone: true,
  imports: [CommonModule]
})
export class AppointmentListComponent implements OnInit {
  appointments: AppointmentResponseDTO[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar las citas', err);
        this.error = 'No se pudieron cargar las citas. Intente nuevamente.';
        this.loading = false;
      }
    });
  }
}
