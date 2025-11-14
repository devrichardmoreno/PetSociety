import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment-service';
import { AuthService } from '../../../services/auth.service';
import { AppointmentHistoryDTO } from '../../../models/dto/appointment-history-dto';
import { Status } from '../../../models/dto/status.enum';
import { Reason } from '../../../models/dto/reason.enum';
import { PetType } from '../../../models/dto/pet-type.enum';
import { HeaderClient } from '../../../components/header-client/header-client';
import { PetEmojiUtil } from '../../../utils/pet-emoji.util';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderClient],
  templateUrl: './client-appointments.html',
  styleUrl: './client-appointments.css'
})
export class ClientAppointmentsComponent implements OnInit {
  // Exponer enums para uso en template
  Status = Status;
  Reason = Reason;
  
  allAppointments: AppointmentHistoryDTO[] = [];
  displayedAppointments: AppointmentHistoryDTO[] = [];
  filteredAppointments: AppointmentHistoryDTO[] = [];
  
  // Filtros
  selectedStatus: Status | 'ALL' = 'ALL';
  selectedPetId: number | 'ALL' = 'ALL';
  selectedReason: Reason | 'ALL' = 'ALL';
  
  // Paginación
  itemsPerPage = 12;
  displayedCount = 0;
  hasMoreItems = false;
  
  // Lista de mascotas únicas para el filtro
  uniquePets: { id: number; name: string }[] = [];
  
  // Modal de diagnóstico
  selectedAppointment: AppointmentHistoryDTO | null = null;
  showDiagnosisModal = false;
  diagnosisData: any = null;
  loadingDiagnosis = false;

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    const clientId = this.authService.getUserId();
    if (!clientId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID del cliente'
      });
      return;
    }

    this.appointmentService.getAppointmentsHistoryByClient(clientId).subscribe({
      next: (appointments) => {
        this.allAppointments = appointments;
        this.extractUniquePets();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las citas'
        });
      }
    });
  }

  extractUniquePets(): void {
    const petsMap = new Map<number, string>();
    this.allAppointments.forEach(appointment => {
      if (!petsMap.has(appointment.petId)) {
        petsMap.set(appointment.petId, appointment.petName);
      }
    });
    this.uniquePets = Array.from(petsMap.entries()).map(([id, name]) => ({ id, name }));
  }

  applyFilters(): void {
    this.filteredAppointments = this.allAppointments.filter(appointment => {
      const statusMatch = this.selectedStatus === 'ALL' || appointment.status === this.selectedStatus;
      // Convertir selectedPetId a número si no es 'ALL' para comparar correctamente
      const petMatch = this.selectedPetId === 'ALL' || appointment.petId === Number(this.selectedPetId);
      const reasonMatch = this.selectedReason === 'ALL' || appointment.reason === this.selectedReason;
      return statusMatch && petMatch && reasonMatch;
    });

    this.displayedCount = 0;
    this.loadMoreItems();
  }

  loadMoreItems(): void {
    const endIndex = this.displayedCount + this.itemsPerPage;
    this.displayedAppointments = this.filteredAppointments.slice(0, endIndex);
    this.displayedCount = endIndex;
    this.hasMoreItems = endIndex < this.filteredAppointments.length;
  }

  loadMore(): void {
    this.loadMoreItems();
  }

  onStatusFilterChange(status: Status | 'ALL'): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  onPetFilterChange(petId: number | string | 'ALL'): void {
    // Convertir a número si no es 'ALL', mantener como 'ALL' si es el caso
    this.selectedPetId = petId === 'ALL' ? 'ALL' : Number(petId);
    this.applyFilters();
  }

  onReasonFilterChange(reason: Reason | 'ALL'): void {
    this.selectedReason = reason;
    this.applyFilters();
  }

  getStatusColor(status: Status): string {
    switch (status) {
      case Status.SUCCESSFULLY:
        return '#7AC143'; // Verde
      case Status.CANCELED:
        return '#dc3545'; // Rojo
      case Status.TO_BEGIN:
        return '#45AEDD'; // Azul
      case Status.RESCHEDULED:
        return '#ffc107'; // Amarillo
      default:
        return '#6c757d'; // Gris
    }
  }

  getStatusLabel(status: Status): string {
    switch (status) {
      case Status.SUCCESSFULLY:
        return 'Completada';
      case Status.CANCELED:
        return 'Cancelada';
      case Status.TO_BEGIN:
        return 'Programada';
      case Status.RESCHEDULED:
        return 'Reprogramada';
      default:
        return status;
    }
  }

  getReasonLabel(reason: Reason): string {
    switch (reason) {
      case Reason.CONTROL:
        return 'Control';
      case Reason.EMERGENCY:
        return 'Emergencia';
      case Reason.VACCINATION:
        return 'Vacunación';
      case Reason.NUTRITION:
        return 'Nutrición';
      default:
        return reason;
    }
  }

  getSpecialityLabel(speciality: string): string {
    switch (speciality) {
      case 'GENERAL_MEDICINE':
        return 'Medicina General';
      case 'INTERNAL_MEDICINE':
        return 'Medicina Interna';
      case 'NUTRITION':
        return 'Nutrición';
      default:
        return speciality;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openDiagnosisModal(appointment: AppointmentHistoryDTO): void {
    if (!appointment.hasDiagnosis || !appointment.diagnosisId) {
      Swal.fire({
        icon: 'info',
        title: 'Sin diagnóstico',
        text: 'Esta cita no tiene diagnóstico disponible'
      });
      return;
    }

    this.selectedAppointment = appointment;
    this.showDiagnosisModal = true;
    this.loadingDiagnosis = true;

    // Aquí deberías llamar al servicio para obtener el diagnóstico completo
    // Por ahora solo mostramos un placeholder
    // TODO: Implementar servicio de diagnósticos cuando esté disponible
    this.diagnosisData = {
      diagnose: 'Diagnóstico no disponible aún',
      treatment: 'Tratamiento no disponible aún'
    };
    this.loadingDiagnosis = false;
  }

  closeDiagnosisModal(): void {
    this.showDiagnosisModal = false;
    this.selectedAppointment = null;
    this.diagnosisData = null;
  }

  getStatusOptions(): (Status | 'ALL')[] {
    return ['ALL', Status.SUCCESSFULLY, Status.CANCELED, Status.TO_BEGIN, Status.RESCHEDULED];
  }

  getReasonOptions(): (Reason | 'ALL')[] {
    return ['ALL', Reason.CONTROL, Reason.EMERGENCY, Reason.VACCINATION, Reason.NUTRITION];
  }

  getPetEmoji(petType: PetType): string {
    return PetEmojiUtil.getEmoji(petType);
  }
}

