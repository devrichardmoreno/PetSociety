import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentDTORequest } from '../../models/dto/appointment/appointment-dto-request';
import { AppointmentResponseDTO } from '../../models/dto/appointment/appointment-response-dto';
import { AppointmentHistoryDTO } from '../../models/dto/appointment/appointment-history-dto';
import { AppointmentDto } from '../../models/dto/appointment/appointment-dto';
import { DoctorAvailabilityDTO } from '../../models/dto/appointment/doctor-availability-dto';
import { AvailableAppointmentDTO } from '../../models/dto/appointment/available-appointment-dto';
import { Reason } from '../../models/enums/reason.enum';
import { Page } from '../../models/shared/page';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private url = 'http://localhost:8080/appointment';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Métodos para creación y gestión de citas
  createAppointment(appointment: AppointmentDTORequest): Observable<AppointmentResponseDTO> {
    return this.http.post<AppointmentResponseDTO>(`${this.url}/create`, appointment, { headers: this.getAuthHeaders() });
  }

  updateAppointment(appointmentId: number, appointment: AppointmentDTORequest): Observable<AppointmentResponseDTO> {
    return this.http.put<AppointmentResponseDTO>(`${this.url}/update/${appointmentId}`, appointment, { headers: this.getAuthHeaders() });
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

  // Métodos para citas por cliente
  getAppointmentsByClient(clientId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/client/${clientId}`, { headers: this.getAuthHeaders() });
  }

  getAppointmentsHistoryByClient(clientId: number): Observable<AppointmentHistoryDTO[]> {
    return this.http.get<AppointmentHistoryDTO[]>(`${this.url}/client/${clientId}/history`, { headers: this.getAuthHeaders() });
  }

  // Métodos para citas por doctor
  getScheduledAppointments(
    doctorId: number,
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
    return this.http.get<AppointmentHistoryDTO[]>(`${this.url}/pastByDoctor/${doctorId}`, { headers: this.getAuthHeaders() });
  }

  // Métodos para disponibilidad del doctor
  uploadDoctorAvailability(doctorId: number, availability: DoctorAvailabilityDTO): Observable<string> {
    return this.http.post(
      `${this.url}/uploadAvailability/${doctorId}`,
      availability,
      {
        headers: this.getAuthHeaders(),
        responseType: 'text'
      }
    );
  }

  // Métodos para citas por mascota
  getAppointmentsByPet(petId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/pet/${petId}`, { headers: this.getAuthHeaders() });
  }

  getAllAppointmentsByPetIncludingScheduled(petId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/pet/${petId}/all`, { headers: this.getAuthHeaders() });
  }

  getScheduledAppointmentIdByPetId(petId: number): Observable<number> {
    return this.http.get<number>(`${this.url}/pet/${petId}/scheduled-id`, { headers: this.getAuthHeaders() });
  }

  // Métodos para citas disponibles
  getAvailableAppointmentsDoctor(doctorId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/doctor/${doctorId}/available`, { headers: this.getAuthHeaders() });
  }

  getAvailableAppointments(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/available`, { headers: this.getAuthHeaders() });
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

  // Métodos para asignación y aprobación
  assignAppointment(appointmentId: number, petId: number): Observable<AppointmentResponseDTO> {
    return this.http.patch<AppointmentResponseDTO>(`${this.url}/assign/${appointmentId}`,
      { petId: petId },
      { headers: this.getAuthHeaders() });
  }

  disapproveAppointment(appointmentId: number): Observable<AppointmentResponseDTO> {
    return this.http.patch<AppointmentResponseDTO>(`${this.url}/disapprove/${appointmentId}`, {}, { headers: this.getAuthHeaders() });
  }

  approveAppointment(appointmentId: number): Observable<AppointmentResponseDTO> {
    return this.http.patch<AppointmentResponseDTO>(`${this.url}/approve/${appointmentId}`, {}, { headers: this.getAuthHeaders() });
  }

  // Métodos generales
  getAllAppointments(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/getAll`, { headers: this.getAuthHeaders() });
  }
}

