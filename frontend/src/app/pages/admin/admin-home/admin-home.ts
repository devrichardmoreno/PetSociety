import { AfterViewInit,ElementRef, viewChild,ViewChild, Component, OnInit } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { AppointmentService } from '../../../services/appointment/appointment.service';
import { AppointmentResponseDTO } from '../../../models/dto/appointment/appointment-response-dto';
import { Status } from '../../../models/enums/status.enum';
import { map, Observable } from 'rxjs';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, RouterLink],
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
    showCharts: boolean = false;
    chartType: 'bar' | 'line' = 'bar';
    
     @ViewChild('barChart') barChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartRef!: ElementRef<HTMLCanvasElement>;

    barChart!: Chart;
    lineChart!: Chart;

    constructor(
      private appointmentService : AppointmentService,
      private router: Router
    ){
        
    }

  

    ngOnInit(): void {
        this.getAllCanceledAppointmentsByMonth();
        this.getAllAppointmentsForToday();
        this.getAllSuccessfulAppointmentsByMonth();
        this.getNextAppointmentToBegin();
        this.getPaidAppointments();
    }

toggleCharts(): void {
  this.showCharts = !this.showCharts;

  if (this.showCharts) {
    setTimeout(() => this.renderChart());
  } else {
    this.barChart?.destroy();
    this.lineChart?.destroy();
  }
}
createBarChart() {

  if (this.barChart) {
    this.barChart.destroy();
  }

  this.barChart = new Chart(this.barChartRef.nativeElement, {
    type: 'bar',
    data: {
      labels: ['Canceladas', 'Exitosas'],
      datasets: [{
        label: 'Citas',
        data: [
          this.canceledAppointments.valueOf() || 0,
          this.petsTreated.valueOf()  || 0,
        ]
      }]
    }
  });
}



toggleChartType() {
  this.chartType = this.chartType === 'bar' ? 'line' : 'bar';
  this.createBarChart();
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

createLineChart() {

  this.lineChart?.destroy();

  const canceled = this.canceledAppointments.valueOf() || 0;
  const treated = this.petsTreated.valueOf()  || 0;
  const paid = this.appointmentsForToday.valueOf()  || 0;

  this.lineChart = new Chart(this.lineChartRef.nativeElement, {
    type: 'line',
    data: {
      labels: ['Inicio', 'Actual'],
      datasets: [
        {
          label: 'Canceladas',
          data: [0, canceled],
          tension: 0.4
        },
        {
          label: 'Exitosas',
          data: [0, treated],
          tension: 0.4
        },
        {
          label: 'Pagadas',
          data: [0, paid],
          tension: 0.4
        }
      ]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
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

      // Filtrar citas futuras (excluyendo canceladas) y ordenar por fecha
      const upcomingAppointments = data
        .filter(a => {
          const start = new Date(a.startTime);
          return (
            a.status !== Status.CANCELED &&
            start > now
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
      console.error('Error al cargar la próxima cita', err);
      this.nextAppointment = null;
    },
  });
}

goToAppointmentDetail(): void {
  if (this.nextAppointment) {
    this.router.navigate(['/admin/appointment', this.nextAppointment.id]);
  }
}

getPaidAppointments(): void {
  this.appointmentService.getAllAppointments().subscribe({
    next: (data) => {
      const paidAppointments = data.filter(a => 
        a.status === Status.TO_BEGIN && 
        a.aproved === true
      ).length;

      this.paidAppointments = paidAppointments;
    },
    error: (err) => {
      console.error('Error al cargar las citas pagadas', err);
      this.paidAppointments = 0;
    }
  });
}

renderChart() {

  if (!this.showCharts) return;

  if (this.chartType === 'bar') {
    this.lineChart?.destroy();
    setTimeout(() => this.createBarChart());
  } else {
    this.barChart?.destroy();
    setTimeout(() => this.createLineChart());
  }

}

  }
  

    



  



