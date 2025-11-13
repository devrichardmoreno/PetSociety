import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentDto } from '../../models/dto/appointment-dto/appointment-dto';
import { Observable } from 'rxjs';
import { AppointmentHistoryDTO } from '../../models/dto/appointment-history-dto';
import { Page } from '../../models/paging/page';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private url = 'http://localhost:8080/appointment';
  
  constructor(private http: HttpClient) { }

  getScheduledAppointments(
    doctorId :  number,
    page = 0,
    size = 5,
    sort?: string
  ): Observable<Page<AppointmentDto>> {

    let params = new HttpParams()
    .set('page', page.toString())
    .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<Page<AppointmentDto>>(`${this.url}/doctor/${doctorId}`, { params });
  }

  getDoctorAllPastAppointments(doctorId: number): Observable<AppointmentHistoryDTO[]> {
    return this.http.get<AppointmentHistoryDTO[]>(`${this.url}/pastByDoctor/${doctorId}`);
  }
}
