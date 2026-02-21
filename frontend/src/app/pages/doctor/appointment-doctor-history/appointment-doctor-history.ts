import { Component, OnInit, OnDestroy, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { AppointmentHistoryDTO, mapAppointmentDateToDate } from '../../../models/dto/appointment/appointment-history-dto';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DiagnoseOfAppointmentModal } from '../diagnoses/diagnose-of-appointment-modal/diagnose-of-appointment-modal';
import { DiagnosisFormModal } from '../diagnoses/diagnosis-form-modal/diagnosis-form-modal';
import { PetEmojiUtil } from '../../../utils/pet-emoji.util';
import { PetType, PetTypeLabels } from '../../../models/enums/pet-type.enum';
import { Reason } from '../../../models/enums/reason.enum';
import { Status } from '../../../models/enums/status.enum';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../utils/error-handler';
import { DiagnosesService } from '../../../services/diagnoses/diagnoses.service';


@Component({
  selector: 'app-appointment-doctor-history',
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './appointment-doctor-history.html',
  styleUrl: './appointment-doctor-history.css'
})
export class AppointmentDoctorHistory implements OnInit, OnDestroy {
  // Exponer enums para uso en template
  Reason = Reason;
  Status = Status;

  appointementArray: AppointmentHistoryDTO[] = [];
  filteredAppointments: AppointmentHistoryDTO[] = [];
  displayedAppointments: AppointmentHistoryDTO[] = [];
  
  // Filtros
  selectedPetId: number | 'ALL' = 'ALL';
  selectedClientName: string | 'ALL' = 'ALL';
  selectedDate: string = '';
  selectedReason: Reason | 'ALL' = 'ALL';
  
  // Listas únicas para filtros
  uniquePets: { id: number; name: string }[] = [];
  uniqueClients: string[] = [];
  
  // Paginación
  itemsPerPage = 12;
  displayedCount = 0;
  hasMoreItems = false;
  
  headerHeight: number = 100; // Valor por defecto
  private resizeListener?: () => void;

  // Modal de detalles
  selectedAppointment: AppointmentHistoryDTO | null = null;
  showDetailsModal = false;
  diagnosisData: any = null;
  loadingDiagnosis = false;

  // Fecha actual para validación
  currentDate: Date = new Date();

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialog,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
    private diagnosesService: DiagnosesService
  ) {}



  ngOnInit(): void {
    // Actualizar fecha actual cada minuto para validación de tiempo
    if (isPlatformBrowser(this.platformId)) {
      this.currentDate = new Date();
      setInterval(() => {
        this.currentDate = new Date();
      }, 60000); // Actualizar cada minuto
    }

    // Calcular altura del header después de que la vista se inicialice
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.calculateHeaderHeight();
        // Recalcular altura del header cuando la ventana cambie de tamaño
        this.resizeListener = () => this.calculateHeaderHeight();
        window.addEventListener('resize', this.resizeListener);
      }, 100);
    }

    const userId = this.authService.getUserId();

    // 1) Si no hay userId: acción segura 
    if (userId === null) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/doctor' } });
      return;
    }
    
    this.appointmentService.getDoctorAllPastAppointments(userId).subscribe({
      next: (appointments) => {
          const mapped = appointments.map(a => mapAppointmentDateToDate(a));
          this.appointementArray = mapped;
          this.extractUniqueValues();
          this.applyFilters();
      },
      error: (error) => {
        console.error('Error cargando citas pasadas del doctor:', error);
        const errorMessage = getFriendlyErrorMessage(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    })
  }

  ngOnDestroy(): void {
    // Remover listener de resize
    if (isPlatformBrowser(this.platformId) && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  calculateHeaderHeight(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          const header = document.querySelector('app-header-doctor .header') as HTMLElement;
          if (header) {
            const height = header.offsetHeight;
            this.ngZone.run(() => {
              this.headerHeight = height; // Solo la altura del header, el espacio adicional se aplica en el HTML
            });
          }
        }, 0);
      });
    }
  }

  openAppointmentDetails(appointment: AppointmentHistoryDTO): void {
    this.selectedAppointment = appointment;
    this.showDetailsModal = true;
    this.diagnosisData = null;
    this.loadingDiagnosis = false;

    // Si tiene diagnóstico, cargarlo
    if (appointment.hasDiagnosis && appointment.diagnosisId) {
      this.loadingDiagnosis = true;
      this.diagnosesService.getDiagnoseById(appointment.diagnosisId).subscribe({
        next: (diagnose) => {
          this.diagnosisData = diagnose;
          this.loadingDiagnosis = false;
        },
        error: (error) => {
          console.error('Error cargando diagnóstico:', error);
          this.loadingDiagnosis = false;
          const errorMessage = getFriendlyErrorMessage(error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#45AEDD',
            iconColor: '#000000'
          });
        }
      });
    }
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedAppointment = null;
    this.diagnosisData = null;
    this.loadingDiagnosis = false;
  }

  canCreateDiagnosis(appointment: AppointmentHistoryDTO & { startDate?: Date | null; endDate?: Date | null }): boolean {
    // Si ya tiene diagnóstico, no se puede crear otro
    if (appointment.hasDiagnosis) {
      return false;
    }
    
    // Necesitamos las fechas de inicio y fin (usar startDate/endDate si están disponibles, sino startTime/endTime)
    const startDate = appointment.startDate || (appointment.startTime ? new Date(appointment.startTime) : null);
    const endDate = appointment.endDate || (appointment.endTime ? new Date(appointment.endTime) : null);
    
    if (!startDate || !endDate) {
      return false;
    }
    
    // Convertir las fechas a timestamps para comparación precisa
    const now = this.currentDate.getTime();
    const start = startDate.getTime();
    const end = endDate.getTime();
    
    // No se puede crear antes de que comience la cita
    if (now < start) {
      return false;
    }
    
    // Para la validación de tiempo después de la cita, dejamos que el backend haga la validación
    // El frontend solo bloquea casos obviamente fuera de rango (más de 2 horas después)
    // Esto evita problemas de desincronización de zona horaria
    const obviouslyTooLate = end + (2 * 60 * 60 * 1000); // Más de 2 horas después
    if (now > obviouslyTooLate) {
      return false;
    }
    
    // Si estamos dentro del rango razonable (desde el inicio hasta 2 horas después del fin),
    // permitimos que el usuario intente crear el diagnóstico y dejamos que el backend valide
    return true;
  }

  openCreateDiagnosisModal(appointmentId: number | null | undefined): void {
    if (!appointmentId || appointmentId === null || appointmentId === undefined) {
      console.error('appointmentId inválido:', appointmentId);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID de la cita.',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    console.log('Abriendo modal de diagnóstico para appointmentId:', appointmentId);
    console.log('Cita seleccionada:', this.selectedAppointment);

    const dialogRef = this.matDialog.open(DiagnosisFormModal, {
      width: '600px',
      data: { appointmentId: Number(appointmentId) },
      panelClass: 'diagnose-dialog-panel'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recargar las citas para actualizar el estado
        const userId = this.authService.getUserId();
        if (userId !== null) {
          this.appointmentService.getDoctorAllPastAppointments(userId).subscribe({
            next: (appointments) => {
              const mapped = appointments.map(a => mapAppointmentDateToDate(a));
              this.appointementArray = mapped;
              this.extractUniqueValues();
              this.applyFilters();
              
              // Si el modal de detalles está abierto, actualizar el diagnóstico
              if (this.selectedAppointment && this.selectedAppointment.appointmentId === appointmentId) {
                // Recargar el diagnóstico
                if (this.selectedAppointment.diagnosisId) {
                  this.loadingDiagnosis = true;
                  this.diagnosesService.getDiagnoseById(this.selectedAppointment.diagnosisId).subscribe({
                    next: (diagnose) => {
                      this.diagnosisData = diagnose;
                      this.loadingDiagnosis = false;
                      // Actualizar el selectedAppointment para reflejar que ahora tiene diagnóstico
                      const updatedAppointment = this.appointementArray.find(a => a.appointmentId === appointmentId);
                      if (updatedAppointment) {
                        this.selectedAppointment = updatedAppointment;
                      }
                    },
                    error: (error) => {
                      console.error('Error cargando diagnóstico:', error);
                      this.loadingDiagnosis = false;
                    }
                  });
                }
              }
            },
            error: (error) => {
              console.error('Error recargando citas:', error);
            }
          });
        }
      }
    });
  }

  openDiagnosisModal(diagnosisId: number | null): void {
    if (diagnosisId === null) return;

    this.matDialog.open(DiagnoseOfAppointmentModal, {
      width: '700px',
      data: { diagnoseId: diagnosisId }
    });
  }

  getPetEmoji(petType?: PetType | string): string {
    return PetEmojiUtil.getEmoji(petType);
  }

  getPetTypeLabel(petType?: PetType | string, otherType?: string): string {
    if (!petType) return '';
    if (petType === PetType.OTHER && otherType) {
      return otherType;
    }
    return PetTypeLabels[petType as PetType] || '';
  }

  getFullPetDisplay(appointment: AppointmentHistoryDTO & { petType?: PetType; otherType?: string }): string {
    if (!appointment.petType) {
      return appointment.petName || '—';
    }
    const emoji = this.getPetEmoji(appointment.petType);
    const typeLabel = this.getPetTypeLabel(appointment.petType, appointment.otherType);
    return `${emoji} ${appointment.petName || '—'}${typeLabel ? ` (${typeLabel})` : ''}`;
  }

  getReasonLabel(reason?: Reason | string): string {
    if (!reason) return 'Sin razón especificada';
    const reasonLabels: { [key in Reason]: string } = {
      [Reason.CONTROL]: 'Control',
      [Reason.VACCINATION]: 'Vacunación',
      [Reason.EMERGENCY]: 'Urgencia',
      [Reason.NUTRITION]: 'Nutrición'
    };
    if (typeof reason === 'string' && reason in reasonLabels) {
      return reasonLabels[reason as Reason];
    }
    return reason;
  }

  extractUniqueValues(): void {
    // Extraer mascotas únicas
    const petsMap = new Map<number, string>();
    const clientsSet = new Set<string>();
    
    this.appointementArray.forEach(appointment => {
      if (!petsMap.has(appointment.petId)) {
        petsMap.set(appointment.petId, appointment.petName);
      }
      if (appointment.clientName) {
        clientsSet.add(appointment.clientName);
      }
    });
    
    this.uniquePets = Array.from(petsMap.entries()).map(([id, name]) => ({ id, name }));
    this.uniqueClients = Array.from(clientsSet).sort();
  }

  applyFilters(): void {
    this.filteredAppointments = this.appointementArray.filter(appointment => {
      // Filtro por mascota
      const petMatch = this.selectedPetId === 'ALL' || appointment.petId === Number(this.selectedPetId);
      
      // Filtro por cliente
      const clientMatch = this.selectedClientName === 'ALL' || 
                         appointment.clientName === this.selectedClientName;
      
      // Filtro por fecha
      let dateMatch = true;
      if (this.selectedDate) {
        // Convertir la fecha de la cita a fecha local sin hora
        const appointmentDate = new Date(appointment.startTime);
        const appointmentDateOnly = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
        
        // Convertir la fecha del filtro a fecha local sin hora
        const filterDateParts = this.selectedDate.split('-');
        const filterDateOnly = new Date(
          parseInt(filterDateParts[0]), 
          parseInt(filterDateParts[1]) - 1, 
          parseInt(filterDateParts[2])
        );
        
        // Comparar solo las fechas (año, mes, día) sin considerar la hora
        dateMatch = appointmentDateOnly.getTime() === filterDateOnly.getTime();
      }
      
      // Filtro por motivo
      const reasonMatch = this.selectedReason === 'ALL' || appointment.reason === this.selectedReason;
      
      return petMatch && clientMatch && dateMatch && reasonMatch;
    });
    
    // Ordenar por fecha (más reciente primero)
    this.filteredAppointments.sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return dateB - dateA;
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

  onPetFilterChange(petId: number | string | 'ALL'): void {
    this.selectedPetId = petId === 'ALL' ? 'ALL' : Number(petId);
    this.applyFilters();
  }

  onClientFilterChange(clientName: string | 'ALL'): void {
    this.selectedClientName = clientName;
    this.applyFilters();
  }

  onDateFilterChange(): void {
    this.applyFilters();
  }

  onReasonFilterChange(reason: Reason | 'ALL'): void {
    this.selectedReason = reason;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedPetId = 'ALL';
    this.selectedClientName = 'ALL';
    this.selectedDate = '';
    this.selectedReason = 'ALL';
    this.applyFilters();
  }

  getReasonOptions(): (Reason | 'ALL')[] {
    return ['ALL', Reason.CONTROL, Reason.EMERGENCY, Reason.VACCINATION, Reason.NUTRITION];
  }

  getStatusLabel(status?: Status | string): string {
    if (!status) return 'Sin estado';
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
        return status.toString();
    }
  }

  getStatusColor(status?: Status | string): string {
    if (!status) return '#999';
    switch (status) {
      case Status.SUCCESSFULLY:
        return '#4caf50';
      case Status.CANCELED:
        return '#f44336';
      case Status.TO_BEGIN:
        return '#2196f3';
      case Status.RESCHEDULED:
        return '#ff9800';
      default:
        return '#999';
    }
  }

  getSpecialityLabel(speciality?: string): string {
    if (!speciality) return 'Sin especialidad';
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

  formatDate(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateString: string | Date): string {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

}
