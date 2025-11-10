import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderDoctor } from "../../../components/header-doctor/header-doctor/header-doctor";
import { AppointmentDto, mapAppointmentDateToDate } from '../../../models/dto/appointment-dto/appointment-dto';
import { DoctorService } from '../../../services/doctor/doctor-service';
import { DiagnosesService } from '../../../services/diagnoses/diagnoses-service';
import { Doctor } from '../../../models/doctor/doctor';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DiagnoseDto } from '../../../models/dto/diagnose-dto/diagnose-dto';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment/appointment-service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DiagnosisFormModal } from '../../diagnosis-form-modal/diagnosis-form-modal';
import { DiagnosesHistoryModal } from '../../diagnoses-history-modal/diagnoses-history-modal';

@Component({
  selector: 'app-doctor-home-page',
  imports: [HeaderDoctor, CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './doctor-home-page.html',
  styleUrl: './doctor-home-page.css'
})
export class DoctorHomePage implements OnInit, OnDestroy {
  showProfile = false;
  appointmentArray: (AppointmentDto & { startDate?: Date | null; endDate?: Date | null })[] = [];
  doctor?: Doctor;
  lastestDiagnoses: DiagnoseDto[] = [];
  loadingDiagnoses = false;
  diagnosesError: string | null = null;
  diagnosesPage = { page: 0, size: 5, totalPages: 0, totalElements: 0 };
  currentDate: Date = new Date();

  private subs = new Subscription();

  constructor(
    private doctorService: DoctorService,
    private diagnosesService: DiagnosesService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.currentDate = new Date();
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

    this.appointmentService.getScheduledAppointments(userId).subscribe({
      next: (appointments) => {
         const mapped = appointments.map(a => mapAppointmentDateToDate(a));
    console.log('Raw appointments from backend:', appointments);
    console.log('Mapped appointments (startDate/endDate):', mapped);
    this.appointmentArray = mapped;
      },
      error: (err) => {
        console.error('Error cargando citas: ', err);
      }
    });
    this.loadLatestDiagnostics(userId, 0, this.diagnosesPage.size, false);
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
        console.log('Diagnóstico enviado:', result);
        // Aquí puedes llamar a un servicio para guardar el diagnóstico
      }
  });
  }

  openDiagnosesHistoryModal(petId : number) {
    const dialogRef = this.dialog.open(DiagnosesHistoryModal, {
      width: '600px',
      data: { petId },
      panelClass: 'diagnose-history-dialog-panel' 
    })
  }

  showDoctorProfile() {
    this.showProfile = true;
  }

  showAppointmentsList() { 
    this.showProfile = false;
  }
}
