import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../services/appointment/appointment.service';
import { AppointmentResponseDTO } from '../../../../models/dto/appointment/appointment-response-dto';
import { OnInit } from '@angular/core';
import { Reason } from '../../../../models/enums/reason.enum';
import { Status } from '../../../../models/enums/status.enum';
import { getFriendlyErrorMessage } from '../../../../utils/error-handler';
import Swal from 'sweetalert2';

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

  /** Estados que el usuario puede ver y filtrar; RESCHEDULED no se muestra. */
  private static readonly FILTER_STATUSES: Status[] = [
    Status.CANCELED,
    Status.SUCCESSFULLY,
    Status.TO_BEGIN,
    Status.AVAILABLE
  ];

  ngOnInit(): void {
    this.loadAppointments();
    this.reasons = Object.values(Reason) as Reason[];
    this.statuses = [...AppointmentListComponent.FILTER_STATUSES];
  }

  getStatusLabel(status: Status | string): string {
    const labels: Record<string, string> = {
      [Status.CANCELED]: 'Cancelada',
      [Status.SUCCESSFULLY]: 'Completada',
      [Status.TO_BEGIN]: 'Por comenzar',
      [Status.AVAILABLE]: 'Disponible',
      RESCHEDULED: 'Reprogramada' // valor legacy del backend, no se ofrece en filtro
    };
    return labels[status as string] ?? (typeof status === 'string' ? status : '');
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
      next: (data: AppointmentResponseDTO[]) => {
        // Ordenar de la más nueva a la más vieja por startTime
        this.appointments = data.sort((a: AppointmentResponseDTO, b: AppointmentResponseDTO) => {
          const dateA = new Date(a.startTime).getTime();
          const dateB = new Date(b.startTime).getTime();
          return dateB - dateA; // Orden descendente (más nueva primero)
        });
        this.populateFilterArrays();
        this.filterAppointments(); // Initial filter and pagination
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        const errorMessage = getFriendlyErrorMessage(err);
        this.error = errorMessage;
        
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar las citas',
          text: errorMessage,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20',
          iconColor: '#000000'
        });
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

  getDisplayPages(): (number | string)[] {
    const total = this.totalPages().length;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    // Si hay 7 páginas o menos, mostrar todas
    if (total <= 7) {
      return this.totalPages();
    }

    // Siempre mostrar primera página
    pages.push(1);

    // Calcular el rango alrededor de la página actual
    const delta = 2; // Páginas a mostrar antes y después de la actual
    let start = Math.max(2, current - delta);
    let end = Math.min(total - 1, current + delta);

    // Ajustar el rango si estamos cerca del inicio o del final
    if (current <= 3) {
      end = Math.min(5, total - 1);
    } else if (current >= total - 2) {
      start = Math.max(total - 4, 2);
    }

    // Agregar puntos suspensivos después de la primera página si es necesario
    if (start > 2) {
      pages.push('...');
    }

    // Agregar páginas en el rango calculado
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Agregar puntos suspensivos antes de la última página si es necesario
    if (end < total - 1) {
      pages.push('...');
    }

    // Siempre mostrar última página (si no es la primera)
    if (total > 1) {
      pages.push(total);
    }

    return pages;
  }
}
