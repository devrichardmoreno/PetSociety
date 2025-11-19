import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Doctor } from '../../models/entities/doctor';
import { AuthService } from '../auth/auth.service';

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

  getAllDoctors(page?: number, size?: number): Observable<Doctor[]> {
    if (page !== undefined && size !== undefined) {
      const params = new HttpParams()
        .set('page', page.toString())
        .set('size', size.toString());

      return this.http.get<any>(`${this.url}/list`, { params })
        .pipe(
          map(response => response.content || response)
        );
    }
    return this.http.get<Doctor[]>(`${this.url}/list`);
  }

  getAllDoctorsEntity(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.url}/list-id`);
  }

  getAllInactiveDoctorsEntity(): Observable<Doctor[]> {
    return this.http.get<Doctor[]>(`${this.url}/list-id/inactive`);
  }

  updateDoctor(doctorId: number, doctor: Doctor): Observable<Doctor> {
    return this.http.patch<Doctor>(`${this.url}/update/${doctorId}`, doctor, {
      headers: this.getAuthHeaders()
    });
  }

  unsubscribeDoctor(doctorId: number): Observable<string> {
    return this.http.patch<string>(`${this.url}/unsubscribe/${doctorId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    });
  }

  reactivateDoctor(doctorId: number): Observable<string> {
    return this.http.patch<string>(`${this.url}/reactivate/${doctorId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    });
  }
}

