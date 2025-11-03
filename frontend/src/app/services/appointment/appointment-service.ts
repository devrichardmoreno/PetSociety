import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentDto } from '../../models/dto/appointment-dto/appointment-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private url = 'http://localhost:8080/appointment';
  
  constructor(private http: HttpClient) { }

  getScheduledAppointments(doctorId :  number): Observable<AppointmentDto[]> {
    return this.http.get<AppointmentDto[]>(`${this.url}/doctor/${doctorId}`);
  }
}
