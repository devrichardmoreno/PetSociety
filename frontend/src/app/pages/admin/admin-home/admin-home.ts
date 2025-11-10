import { Component, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AppointmentService } from '../../../services/appointment-service';
import { AppointmentResponseDTO } from '../../../models/dto/appointment-response-dto';
import { Status } from '../../../models/dto/status.enum';


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
    paidAppointments! :Number

    constructor(private appointmentService : AppointmentService){

    }

    ngOnInit(): void {
      this.allCanceledAppointmentByMonth();
    }

    allCanceledAppointmentByMonth(){
      this.appointmentService.getAllAppointments().subscribe({
        next: (data) => {
          this.totalAppointments = data;
          this.canceledAppointments = data.filter(appointment => appointment.status === Status.CANCELED).length;
        },
        error: () => {}
      })

      }
    }


