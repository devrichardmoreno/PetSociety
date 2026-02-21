import { Component, OnInit, OnDestroy, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HeaderDoctor } from "../../../components/headers/doctor-header/header-doctor";
import { AppointmentDto, mapAppointmentDateToDate } from '../../../models/dto/appointment/appointment-dto';
import { DoctorService } from '../../../services/doctor/doctor.service';
import { DiagnosesService } from '../../../services/diagnoses/diagnoses.service';
import { Doctor } from '../../../models/entities/doctor';
import { AuthService } from '../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { DiagnoseDto } from '../../../models/dto/diagnose/diagnose-dto';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DiagnosisFormModal } from '../diagnoses/diagnosis-form-modal/diagnosis-form-modal';
import { DiagnosesHistoryModal } from '../../shared/diagnoses/diagnoses-history-modal/diagnoses-history-modal';
import { Subscription, interval } from 'rxjs';
import { PetEmojiUtil } from '../../../utils/pet-emoji.util';
import { PetType, PetTypeLabels } from '../../../models/enums/pet-type.enum';
import { DiagnoseDetailModal } from '../diagnoses/diagnose-detail-modal/diagnose-detail-modal';
import { Reason } from '../../../models/enums/reason.enum';
import { Speciality } from '../../../models/enums/speciality.enum';


@Component({
  selector: 'app-doctor-home-page',
  imports: [HeaderDoctor, CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './doctor-home-page.html',
  styleUrl: './doctor-home-page.css'
})
export class DoctorHomePage implements OnInit, OnDestroy {
  showProfile = false;
  appointmentArray: (AppointmentDto & {
     startDate?: Date | null;
     endDate?: Date | null;
     hasDiagnose?: boolean;
     diagnosisId?: number;
     })[] = [];
  doctor?: Doctor;
  lastestDiagnoses: (DiagnoseDto & { date: Date; appointmentStartDate?: Date | null; appointmentEndDate?: Date | null })[] = [];
  loadingDiagnoses = false;
  diagnosesError: string | null = null;
  diagnosesPage = { page: 0, size: 3, totalPages: 0, totalElements: 0 };
  appointmentsPage = { page: 0, size: 5, totalPages: 0, totalElements: 0};
  loadingAppointments = false;
  appointmentsError: string | null = null;

  currentDate: Date = new Date();
  headerHeight: number = 100; // Valor por defecto

  private subs = new Subscription();
  private timeCheckInterval?: Subscription;
  private resizeListener?: () => void;

  constructor(
    private doctorService: DoctorService,
    private diagnosesService: DiagnosesService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.currentDate = new Date();
    
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

    // 2) Si hay userId, llamar al servicio
    this.doctorService.getDoctorById(userId).subscribe({
      next: (doc) => {
        this.doctor = doc;
      },
      error: (err) => {
        console.error('Error cargando doctor:', err);
      }
    });
    this.loadScheduledAppointments(userId, 0, 5);
    
    this.loadLatestDiagnostics(userId, 0, this.diagnosesPage.size, false);

    // Verificar tiempo cada minuto para actualizar botones de crear diagnóstico
    this.timeCheckInterval = interval(60000).subscribe(() => {
      this.currentDate = new Date();
      // Recargar citas para actualizar el estado de los botones
      if (userId) {
        this.loadScheduledAppointments(userId, this.appointmentsPage.page, this.appointmentsPage.size);
      }
    });
  }

  loadScheduledAppointments(doctorId: number, page = 0, size = 5) {
      const s = this.appointmentService.getScheduledAppointments(doctorId, page, size).subscribe({
        next: (pageResp) => {

          const mapped = (pageResp?.content ?? []).map(mapAppointmentDateToDate);
          this.appointmentArray = mapped;

          this.appointmentsPage.page = pageResp.number ?? page;
          this.appointmentsPage.size = pageResp.size ?? size;
          this.appointmentsPage.totalPages = pageResp.totalPages ?? 0;
          this.appointmentsPage.totalElements = pageResp.totalElements ?? 0;
          this.loadingAppointments = false;
        },

        error: (err) => {
          console.error(err);
          this.appointmentsError = 'Error cargando citas programadas';
          this.loadingAppointments = false;
        }
      })
      this.subs.add(s);
  }

  loadNextAppointmentsPage() {
  if (this.appointmentsPage.page + 1 >= this.appointmentsPage.totalPages) return;
  const userId = this.authService.getUserId();
  if (userId === null) return;
  this.loadScheduledAppointments(userId, this.appointmentsPage.page + 1, this.appointmentsPage.size);
}

loadPrevAppointmentsPage() {
  if (this.appointmentsPage.page <= 0) return;
  const userId = this.authService.getUserId();
  if (userId === null) return;
  this.loadScheduledAppointments(userId, this.appointmentsPage.page - 1, this.appointmentsPage.size);
}


  loadLatestDiagnostics(doctorId: number, page = 0, size = 5, append = false) {
    this.loadingDiagnoses = true;
    this.diagnosesError = null;

    const s = this.diagnosesService.getLatestDiagnosesByDoctor(doctorId, page, size).subscribe({
      next: pageResp => {
        const items = pageResp?.content ?? [];
        this.lastestDiagnoses = append ? [...this.lastestDiagnoses, ...items] : items;
        this.diagnosesPage.page = pageResp.number ?? page;
        this.diagnosesPage.size = pageResp.size ?? size;
        this.diagnosesPage.totalPages = pageResp.totalPages ?? 0;
        this.diagnosesPage.totalElements = pageResp.totalElements ?? 0;
        this.loadingDiagnoses = false;
      },
      error: err => {
        console.error(err);
        this.diagnosesError = 'Error cargando diagnósticos';
        this.loadingDiagnoses = false;
      }
    });

    this.subs.add(s);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.timeCheckInterval) {
      this.timeCheckInterval.unsubscribe();
    }
    // Remover listener de resize
    if (isPlatformBrowser(this.platformId) && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  // helpers
  loadNextPage() {
    if (this.diagnosesPage.page + 1 >= this.diagnosesPage.totalPages) return;
    const userId = this.authService.getUserId();
    if (userId === null) return;
    this.loadLatestDiagnostics(userId, this.diagnosesPage.page + 1, this.diagnosesPage.size, true);
  }

  loadPrevPage() {
    if (this.diagnosesPage.page <= 0) return;
    const userId = this.authService.getUserId();
    if (userId === null) return;
    this.loadLatestDiagnostics(userId, this.diagnosesPage.page - 1, this.diagnosesPage.size, false);
  }

  openDiagnosisModal(appointmentId: number) {
    const dialogRef = this.dialog.open(DiagnosisFormModal, {
      width: '600px',
      data: { appointmentId },
      panelClass: 'diagnose-dialog-panel' 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { 
        // Recargar citas y diagnósticos para obtener el estado actualizado del backend
        const userId = this.authService.getUserId();
        if (userId !== null) {
          // Recargar citas para actualizar el estado hasDiagnose
          this.loadScheduledAppointments(userId, this.appointmentsPage.page, this.appointmentsPage.size);
          // Recargar diagnósticos automáticamente
          this.loadLatestDiagnostics(userId, 0, this.diagnosesPage.size, false);
        }
      }
  });
  }

  openDiagnosesHistoryModal(petId : number) {
    const dialogRef = this.dialog.open(DiagnosesHistoryModal, {
      width: '800px',
      maxWidth: '90vw',
      data: { petId },
      panelClass: 'diagnose-history-dialog-panel',
      autoFocus: false
    })
  }

  openDiagnoseDetailModal(diagnose: DiagnoseDto & { date: Date; appointmentStartDate?: Date | null; appointmentEndDate?: Date | null }) {
    this.dialog.open(DiagnoseDetailModal, {
      width: '700px',
      data: { diagnose },
      panelClass: 'diagnose-detail-dialog-panel'
    });
  }

  openDiagnoseDetailModalFromAppointment(appointment: AppointmentDto & { startDate?: Date | null; endDate?: Date | null; hasDiagnose?: boolean; diagnosisId?: number }) {
    if (!appointment.diagnosisId) {
      console.error('No diagnosisId found for appointment:', appointment.id);
      return;
    }

    this.diagnosesService.getDiagnoseById(appointment.diagnosisId).subscribe({
      next: (diagnose) => {
        const diagnoseWithDates = {
          ...diagnose,
          appointmentStartDate: appointment.startDate || null,
          appointmentEndDate: appointment.endDate || null
        };
        this.openDiagnoseDetailModal(diagnoseWithDates);
      },
      error: (error) => {
        console.error('Error loading diagnosis:', error);
      }
    });
  }

  showDoctorProfile() {
    this.showProfile = true;
  }

  showAppointmentsList() { 
    this.showProfile = false;
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

  getFullPetDisplay(appointment: AppointmentDto & { petType?: PetType; otherType?: string }): string {
    if (!appointment.petType) {
      return appointment.petName;
    }
    const emoji = this.getPetEmoji(appointment.petType);
    const typeLabel = this.getPetTypeLabel(appointment.petType, appointment.otherType);
    return `${emoji} ${appointment.petName}${typeLabel ? ` (${typeLabel})` : ''}`;
  }

  getFullPetDisplayForDiagnose(diagnose: DiagnoseDto & { petType?: PetType; otherType?: string }): string {
    if (!diagnose.petType) {
      return diagnose.petName;
    }
    const emoji = this.getPetEmoji(diagnose.petType);
    const typeLabel = this.getPetTypeLabel(diagnose.petType, diagnose.otherType);
    return `${emoji} ${diagnose.petName}${typeLabel ? ` (${typeLabel})` : ''}`;
  }

  canCreateDiagnosis(appointment: AppointmentDto & { startDate?: Date | null; endDate?: Date | null; hasDiagnose?: boolean }): boolean {
    if (appointment.hasDiagnose) return false;
    if (!appointment.startDate || !appointment.endDate) return false;
    
    // Convertir las fechas a timestamps para comparación precisa
    const now = this.currentDate.getTime();
    const start = appointment.startDate.getTime();
    const end = appointment.endDate.getTime();
    
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

  getSpecialityLabel(speciality?: Speciality | string): string {
    if (!speciality) return 'Sin especialidad';
    const specialityLabels: { [key in Speciality]: string } = {
      [Speciality.GENERAL_MEDICINE]: 'Medicina General',
      [Speciality.INTERNAL_MEDICINE]: 'Medicina Interna',
      [Speciality.NUTRITION]: 'Nutrición'
    };
    if (typeof speciality === 'string' && speciality in specialityLabels) {
      return specialityLabels[speciality as Speciality];
    }
    return speciality;
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
}
