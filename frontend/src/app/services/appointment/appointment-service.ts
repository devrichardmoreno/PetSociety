import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentDto } from '../../models/dto/appointment-dto/appointment-dto';
import { Observable } from 'rxjs';
import { AppointmentHistoryDTO } from '../../models/dto/appointment-history-dto';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private url = 'http://localhost:8080/appointment';
  
  constructor(private http: HttpClient) { }

  getScheduledAppointments(doctorId :  number): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.url}/doctor/${doctorId}`);
  }

  getDoctorAllPastAppointments(doctorId: number): Observable<AppointmentHistoryDTO[]> {
    return this.http.get<AppointmentHistoryDTO[]>(`${this.url}/pastByDoctor/${doctorId}`);
  }
}
