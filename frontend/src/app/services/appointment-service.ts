import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentDTORequest } from '../models/dto/appointment-dto-request';
import { AppointmentResponseDTO } from '../models/dto/appointment-response-dto';
import { AppointmentHistoryDTO } from '../models/dto/appointment-history-dto';
import { DoctorAvailabilityDTO } from '../models/dto/doctor-availability-dto';
import { AvailableAppointmentDTO } from '../models/dto/available-appointment-dto';
import { Reason } from '../models/dto/reason.enum';
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
    return this.http.delete(`${this.url}/cancel/${appointmentId}`, { 
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }) as Observable<string>;
  }

  getAppointmentById(appointmentId: number): Observable<AppointmentResponseDTO> {
    return this.http.get<AppointmentResponseDTO>(`${this.url}/findAppointment/${appointmentId}`, { headers: this.getAuthHeaders() });
  }

  getAppointmentsByClient(clientId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/client/${clientId}`, { headers: this.getAuthHeaders() });
  }

  getAppointmentsHistoryByClient(clientId: number): Observable<AppointmentHistoryDTO[]> {
    return this.http.get<AppointmentHistoryDTO[]>(`${this.url}/client/${clientId}/history`, { headers: this.getAuthHeaders() });
  }

  uploadDoctorAvailability(doctorId: number, availability: DoctorAvailabilityDTO): Observable<string> {
  return this.http.post(
    `${this.url}/uploadAvailability/${doctorId}`,
    availability,
    {
      headers: this.getAuthHeaders(),
      responseType: 'text'  // 👈 importante: no pongas 'as json' acá
    }
  );
}

  getAppointmentsByPet(petId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/pet/${petId}`, { headers: this.getAuthHeaders() });
  }

  getAllAppointmentsByPetIncludingScheduled(petId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/pet/${petId}/all`, { headers: this.getAuthHeaders() });
  }

  getAvailableAppointmentsDoctor(doctorId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/doctor/${doctorId}/available`, { headers: this.getAuthHeaders() });
  }

  getAvailableAppointments(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/available`, { headers: this.getAuthHeaders() });
  }

  getAllAppointments(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/getAll`, { headers: this.getAuthHeaders() });
  }

  getAvailableAppointmentsByReason(reason: Reason): Observable<AvailableAppointmentDTO[]> {
    return this.http.get<AvailableAppointmentDTO[]>(`${this.url}/available/reason/${reason}`, { headers: this.getAuthHeaders() });
  }

  getAvailableAppointmentsByReasonAndDate(reason: Reason, date: string): Observable<AvailableAppointmentDTO[]> {
    const params = new HttpParams().set('date', date);
    return this.http.get<AvailableAppointmentDTO[]>(`${this.url}/available/reason/${reason}/date`, { 
      headers: this.getAuthHeaders(),
      params: params
    });
  }

  getAvailableDaysByReason(reason: Reason): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/available/reason/${reason}/days`, { headers: this.getAuthHeaders() });
  }

  assignAppointment(appointmentId: number, petId: number): Observable<AppointmentResponseDTO> {
    return this.http.patch<AppointmentResponseDTO>(`${this.url}/assign/${appointmentId}`, 
      { petId: petId }, 
      { headers: this.getAuthHeaders() });
  }

  getScheduledAppointmentIdByPetId(petId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/pet/${petId}/scheduled-id`, { headers: this.getAuthHeaders() });
  }
}
