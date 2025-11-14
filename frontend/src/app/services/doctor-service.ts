import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Doctor } from '../models/doctor';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private url = 'http://localhost:8080/doctor';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getDoctorById(doctorId: number): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.url}/find/${doctorId}`);
  }

  getAllDoctors(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.url}/list`);
  }

  getAllDoctorsEntity(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.url}/list-id`);
  }

  updateDoctor(doctorId: number, doctor: Doctor): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.url}/update/${doctorId}`, doctor, {
      headers: this.getAuthHeaders()
    });
  }
}
