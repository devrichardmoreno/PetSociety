import { Component, OnInit, OnDestroy } from '@angular/core';
import { HeaderDoctor } from "../../../components/header-doctor/header-doctor/header-doctor";
import { AppointmentDto } from '../../../models/dto/appointment-dto/appointment-dto';
import { DoctorService } from '../../../services/doctor/doctor-service';
import { DiagnosesService } from '../../../services/diagnoses/diagnoses-service';
import { Doctor } from '../../../models/doctor/doctor';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DiagnoseDto } from '../../../models/dto/diagnose-dto/diagnose-dto';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment/appointment-service';

@Component({
  selector: 'app-doctor-home-page',
  imports: [HeaderDoctor, CommonModule],
  templateUrl: './doctor-home-page.html',
  styleUrl: './doctor-home-page.css'
})
export class DoctorHomePage implements OnInit, OnDestroy {
  appointmentArray: AppointmentDto[] = [];
  doctor?: Doctor;
  lastestDiagnoses: DiagnoseDto[] = [];
  loadingDiagnoses = false;
  diagnosesError: string | null = null;
  diagnosesPage = { page: 0, size: 5, totalPages: 0, totalElements: 0 };

  private subs = new Subscription();

  constructor(
    private doctorService: DoctorService,
    private diagnosesService: DiagnosesService,
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
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
        // aquí puedes cargar appointments/diagnósticos usando doc.id u otros
      },
      error: (err) => {
        console.error('Error cargando doctor:', err);
        // manejar error
      }
    });

    this.appointmentService.getScheduledAppointments(userId).subscribe({
      next: (appointments) => {
        this.appointmentArray = appointments
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

    const s = this.diagnosesService.getLatestDiagnoses(doctorId, page, size).subscribe({
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
}
