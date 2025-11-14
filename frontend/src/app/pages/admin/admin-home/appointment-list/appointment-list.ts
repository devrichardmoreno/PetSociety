import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../services/appointment-service';
import { AppointmentResponseDTO } from '../../../../models/dto/appointment-response-dto';
import { OnInit } from '@angular/core';
import { Reason } from '../../../../models/dto/reason.enum';
import { Status } from '../../../../models/dto/status.enum';

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
  selectedApproved: string = ''; // New property for approved filter
  doctors: string[] = [];
  statuses: Status[] = [];
  reasons: Reason[] = [];
  approvedOptions: string[] = ['Sí', 'No']; // Options for the approved filter
  currentPage: number = 1;
  itemsPerPage: number = 10;

  paginatedAppointments: AppointmentResponseDTO[] = [];

  constructor(private appointmentService: AppointmentService, private router: Router) {}

  ngOnInit(): void {
    this.loadAppointments();
    this.reasons = Object.values(Reason) as Reason[];
    this.statuses = Object.values(Status) as Status[];
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

  goToAppointmentDetail(appointmentId: number): void {
    this.router.navigate(['/admin/appointment', appointmentId]);
  }

  loadAppointments(): void {
    this.loading = true;
    this.error = null;

    this.appointmentService.getAllAppointments().subscribe({
      next: (data) => {
        // Ordenar de la más nueva a la más vieja por startTime
        this.appointments = data.sort((a, b) => {
          const dateA = new Date(a.startTime).getTime();
          const dateB = new Date(b.startTime).getTime();
          return dateB - dateA; // Orden descendente (más nueva primero)
        });
        this.populateFilterArrays();
        this.filterAppointments(); // Initial filter and pagination
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
    this.doctors = [...new Set(doctorNames)];
    // Los statuses y reasons ya están inicializados con todos los valores del enum
  }

  filterAppointments(): void {
    let filtered = this.appointments;

    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.doctorName.toLowerCase().includes(searchTermLower) ||
        appointment.petName.toLowerCase().includes(searchTermLower) ||
        this.getReasonLabel(appointment.reason).toLowerCase().includes(searchTermLower) ||
        this.getStatusLabel(appointment.status).toLowerCase().includes(searchTermLower) ||
        appointment.reason.toLowerCase().includes(searchTermLower) ||
        appointment.status.toLowerCase().includes(searchTermLower)
      );
    }

    if (this.searchDate) {
      filtered = filtered.filter(appointment => {
        // Crear fechas en zona horaria local para evitar problemas de UTC
        const appointmentDate = new Date(appointment.startTime);
        // this.searchDate viene en formato "YYYY-MM-DD", crear fecha en zona local
        const [year, month, day] = this.searchDate.split('-').map(Number);
        const searchDateLocal = new Date(year, month - 1, day); // month es 0-indexed
        
        // Comparar solo año, mes y día en zona horaria local
        return appointmentDate.getFullYear() === searchDateLocal.getFullYear() &&
               appointmentDate.getMonth() === searchDateLocal.getMonth() &&
               appointmentDate.getDate() === searchDateLocal.getDate();
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

    // New filter for approved status
    if (this.selectedApproved !== '') {
      const isApproved = this.selectedApproved === 'Sí';
      filtered = filtered.filter(appointment => appointment.aproved === isApproved);
    }

    // Ordenar de la más nueva a la más vieja por startTime
    filtered = filtered.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return dateB - dateA; // Orden descendente (más nueva primero)
    });

    this.filteredAppointments = filtered;
    this.currentPage = 1;
    this.updatePaginatedAppointments();
  }

  updatePaginatedAppointments(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedAppointments = this.filteredAppointments.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages().length) {
      this.currentPage++;
      this.updatePaginatedAppointments();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedAppointments();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedAppointments();
  }

  totalPages(): number[] {
    const pageCount = Math.ceil(this.filteredAppointments.length / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
}
