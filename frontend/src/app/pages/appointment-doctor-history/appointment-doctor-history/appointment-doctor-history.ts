import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment/appointment-service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { AppointmentHistoryDTO, mapAppointmentDateToDate } from '../../../models/dto/appointment-history-dto';


@Component({
  selector: 'app-appointment-doctor-history',
  imports: [CommonModule],
  templateUrl: './appointment-doctor-history.html',
  styleUrl: './appointment-doctor-history.css'
})
export class AppointmentDoctorHistory implements OnInit{

  appointementArray: AppointmentHistoryDTO[] = [];

  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService,
    private router: Router
  ) {}



  ngOnInit(): void {

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
      },
      error: (erro) => {
        console.error('Error cargando citas pasadas del doctor:', erro);
      }
    })
  }


}
