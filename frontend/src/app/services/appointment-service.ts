import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentDTORequest } from '../models/dto/appointment-dto-request';
import { AppointmentResponseDTO } from '../models/dto/appointment-response-dto';
import { DoctorAvailabilityDTO } from '../models/dto/doctor-availability-dto';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private url  = 'http://localhost:8080/appointment'; 

  constructor(private http: HttpClient, private authService: AuthService) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  createAppointment(appointment: AppointmentDTORequest): Observable<AppointmentResponseDTO> {
    return this.http.post<AppointmentResponseDTO>(`${this.url}/create`, appointment, { headers: this.getAuthHeaders() });
  }

  updateAppointment(appointmentId: number, appointment: AppointmentDTORequest): Observable<AppointmentResponseDTO> {
    return this.http.patch<AppointmentResponseDTO>(`${this.url}/update/${appointmentId}`, appointment, { headers: this.getAuthHeaders() });
  }

  cancelAppointment(appointmentId: number): Observable<string> {
    return this.http.delete<string>(`${this.url}/cancel/${appointmentId}`, { headers: this.getAuthHeaders() });
  }

  getAppointmentById(appointmentId: number): Observable<AppointmentResponseDTO> {
    return this.http.get<AppointmentResponseDTO>(`${this.url}/findAppointment/${appointmentId}`, { headers: this.getAuthHeaders() });
  }

  getAppointmentsByClient(clientId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/client/${clientId}`, { headers: this.getAuthHeaders() });
  }

  uploadDoctorAvailability(doctorId: number, availability: DoctorAvailabilityDTO): Observable<string> {
    return this.http.post<string>(`${this.url}/uploadAvailability/${doctorId}`, availability, { headers: this.getAuthHeaders() });
  }

  getAppointmentsByPet(petId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/pet/${petId}`, { headers: this.getAuthHeaders() });
  }

  getAvailableAppointmentsDoctor(doctorId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/doctor/${doctorId}/available`, { headers: this.getAuthHeaders() });
  }

  getAvailableAppointments(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/available`, { headers: this.getAuthHeaders() });
  }

  getAllAppointments(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/list`, { headers: this.getAuthHeaders() });
  }
}
