import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Doctor } from '../../models/doctor/doctor';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private url = 'http://localhost:8080/doctor';

  constructor(private http: HttpClient) { }

  getDoctorById(doctorId: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.url}/find/${doctorId}`);
  }

  getAllDoctors(page: number = 0, size: number = 10): Observable<Doctor[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Doctor[]>(`${this.url}/list`, { params });
  }
}
