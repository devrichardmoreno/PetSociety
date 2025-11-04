import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentDto } from '../../models/dto/appointment-dto/appointment-dto';
import { Page } from '../../models/paging/page';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Doctor } from '../../models/doctor/doctor';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private url = 'http://localhost:8080/doctor';

  constructor(private http: HttpClient) { }


  getDoctorById(doctorId: number): Observable<Doctor> {
    return this.http.get<Doctor>(
      `${this.url}/find/${doctorId}`
    );
  }
}
