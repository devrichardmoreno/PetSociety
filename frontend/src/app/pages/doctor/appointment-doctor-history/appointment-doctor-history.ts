import { Component, OnInit, OnDestroy, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { AppointmentHistoryDTO, mapAppointmentDateToDate } from '../../../models/dto/appointment/appointment-history-dto';
import { MatDialog } from '@angular/material/dialog';
import { DiagnoseOfAppointmentModal } from '../diagnoses/diagnose-of-appointment-modal/diagnose-of-appointment-modal';
import { PetEmojiUtil } from '../../../utils/pet-emoji.util';
import { PetType, PetTypeLabels } from '../../../models/enums/pet-type.enum';
import { Reason } from '../../../models/enums/reason.enum';


@Component({
  selector: 'app-appointment-doctor-history',
  imports: [CommonModule, FormsModule],
  templateUrl: './appointment-doctor-history.html',
  styleUrl: './appointment-doctor-history.css'
})
export class AppointmentDoctorHistory implements OnInit, OnDestroy {
  // Exponer enums para uso en template
  Reason = Reason;

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

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private matDialog: MatDialog,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}



  ngOnInit(): void {
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
      error: (erro) => {
        console.error('Error cargando citas pasadas del doctor:', erro);
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

  goToDiagnose(diagnoseId: number | null): void{
    if(diagnoseId === null) return;

     this.matDialog.open(DiagnoseOfAppointmentModal,{
      width: '700px',
      data: {diagnoseId: diagnoseId}
     })
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

}
