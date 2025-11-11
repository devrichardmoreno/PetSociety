import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../services/appointment-service';
import { AppointmentResponseDTO } from '../../../../models/dto/appointment-response-dto';
import { FormsModule } from '@angular/forms';
import { Reason } from '../../../../models/dto/reason.enum';

@Component({
  selector: 'app-appointment-list',
  templateUrl: './appointment-list.html',
  styleUrls: ['./appointment-list.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class AppointmentListComponent implements OnInit {
  appointments: AppointmentResponseDTO[] = [];
  filteredAppointments: AppointmentResponseDTO[] = [];
  loading: boolean = false;
  error: string | null = null;
  searchTerm: string = '';
  searchDate: string = '';
  selectedDoctor: string = '';
  selectedStatus: string = '';
  selectedReason: string = '';
  doctors: string[] = [];
  statuses: string[] = [];
  reasons: string[] = [];

  constructor(private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.reasons = Object.values(Reason);
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        this.appointments = data;
        this.filteredAppointments = data;
        this.populateFilterArrays();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar las citas', err);
        this.error = `No se pudieron cargar las citas. Error: ${err.message}`;
        this.loading = false;
      }
    });
  }

  populateFilterArrays(): void {
    const doctorNames = this.appointments.map(appt => appt.doctorName);
    const statusValues = this.appointments.map(appt => appt.status);
    this.doctors = [...new Set(doctorNames)];
    this.statuses = [...new Set(statusValues)];
  }

  filterAppointments(): void {
    let filtered = this.appointments;

    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(searchTermLower) ||
        appointment.petName.toLowerCase().includes(searchTermLower) ||
        appointment.reason.toLowerCase().includes(searchTermLower) ||
        appointment.status.toLowerCase().includes(searchTermLower)
      );
    }

    if (this.searchDate) {
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.startTime);
        const searchDate = new Date(this.searchDate);
        return appointmentDate.getFullYear() === searchDate.getFullYear() &&
               appointmentDate.getMonth() === searchDate.getMonth() &&
               appointmentDate.getDate() === searchDate.getDate();
      });
    }

    if (this.selectedDoctor) {
      filtered = filtered.filter(appointment => appointment.doctorName === this.selectedDoctor);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(appointment => appointment.status === this.selectedStatus);
    }

    if (this.selectedReason) {
      filtered = filtered.filter(appointment => appointment.reason === this.selectedReason);
    }

    this.filteredAppointments = filtered;
  }
}
