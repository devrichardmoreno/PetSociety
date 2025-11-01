import { Component, OnInit } from '@angular/core';
import { HeaderDoctor } from "../../../components/header-doctor/header-doctor/header-doctor";
import { LoginDTO } from '../../../models/dto/login-dto';
import { AppointmentDto } from '../../../models/dto/appointment-dto/appointment-dto';
import { DoctorService } from '../../../services/doctor/doctor-service';
import { DiagnosesService } from '../../../services/diagnoses/diagnoses-service';
import { Doctor } from '../../../models/doctor/doctor';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-doctor-home-page',
  imports: [HeaderDoctor],
  templateUrl: './doctor-home-page.html',
  styleUrl: './doctor-home-page.css'
})
export class DoctorHomePage implements OnInit {
  appointmentArray: AppointmentDto[] = [];
  doctor?: Doctor;

  constructor(
    private doctorService: DoctorService,
    private diagnosesService: DiagnosesService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const userId = this.authService.getUserId();

    // 1) Si no hay userId: acción segura (redirigir a login o mostrar mensaje)
    if (userId === null) {
      // redirige al login guardando returnUrl si quieres
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/doctor' } });
      return;
    }

    // 2) Si hay userId, llamar al servicio (recuerda que devuelve Observable)
    this.doctorService.getDoctorById(userId).subscribe({
      next: (doc) => {
        this.doctor = doc;
        // aquí puedes cargar appointments/diagnósticos usando doc.id u otros
      },
      error: (err) => {
        console.error('Error cargando doctor:', err);
        // manejar error (notificación, retry, redirigir, etc.)
      }
    });
  }
}
