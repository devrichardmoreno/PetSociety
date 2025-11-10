import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AppointmentService } from '../../../services/appointment-service';
import { AppointmentResponseDTO } from '../../../models/dto/appointment-response-dto';
import { Status } from '../../../models/dto/status.enum';
import { map, Observable } from 'rxjs';


@Component({
  selector: 'app-admin-home',
  imports: [],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css'
})
export class AdminHome implements OnInit {
  
    totalAppointments! : AppointmentResponseDTO[]
    canceledAppointments! : Number
    appointmentsForToday! : Number
    petsTreated! : Number
    nextAppointment!: AppointmentResponseDTO | null;
    paidAppointments! :Number

    constructor(private appointmentService : AppointmentService){
        
    }

    ngOnInit(): void {
        this.getAllCanceledAppointmentsByMonth();
        this.getAllAppointmentsForToday();
        this.getAllSuccessfulAppointmentsByMonth();
        this.getNextAppointmentToBegin();
    }

    
   getAllCanceledAppointmentsByMonth(): void {
    this.appointmentService.getAllAppointments().subscribe({
    next: (data) => {
      const currentMonth = new Date().getMonth();
      const canceledThisMonth = data.filter(
        a =>
          a.status === Status.CANCELED &&
          new Date(a.startTime).getMonth() === currentMonth
      ).length;

      this.canceledAppointments = canceledThisMonth;
    },
    error: (err) => {
      console.error('Error al cargar las citas', err);
    }
  });
  }

 getAllAppointmentsForToday(): void {
  this.appointmentService.getAvailableAppointments().subscribe({
    next: (data) => {
      const today = new Date();

      const appointmentsToday = data.filter(a => {
        const appointmentDate = new Date(a.startTime);
        return (
          a.status === Status.AVAILABLE &&
          appointmentDate.getDate() === today.getDate() &&
          appointmentDate.getMonth() === today.getMonth() &&
          appointmentDate.getFullYear() === today.getFullYear()
        );
      }).length;

      this.appointmentsForToday = appointmentsToday;
    },
    error: (err) => {
      console.error('Error al cargar las citas de hoy', err);
    }
  });
}

getAllSuccessfulAppointmentsByMonth(): void {
  this.appointmentService.getAllAppointments().subscribe({
    next: (data) => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const successfulThisMonth = data.filter(a => {
        const appointmentDate = new Date(a.startTime);
        return (
          a.status === Status.SUCCESSFULLY &&
          appointmentDate.getMonth() === currentMonth &&
          appointmentDate.getFullYear() === currentYear
        );
      }).length;

      this.petsTreated = successfulThisMonth;
    },
    error: (err) => {
      console.error('Error al cargar las citas exitosas del mes', err);
    }
  });
}

getNextAppointmentToBegin(): void {
  this.appointmentService.getAllAppointments().subscribe({
    next: (data) => {
      const now = new Date();

      const upcomingAppointments = data
        .filter(a => {
          const start = new Date(a.startTime);
          return (
            a.status === Status.TO_BEGIN &&
            start > now &&
            a.petName != null && a.petName.trim() !== ''
          );
        })
        .sort(
          (a, b) =>
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

      this.nextAppointment =
        upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;
    },
    error: (err) => {
      console.error('Error al cargar la próxima cita por comenzar', err);
    },
  });
}

  }
  

    



  



