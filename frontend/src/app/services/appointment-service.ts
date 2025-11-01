import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppointmentDTORequest } from '../models/dto/appointment-dto-request';
import { AppointmentResponseDTO } from '../models/dto/appointment-response-dto';
import { DoctorAvailabilityDTO } from '../models/dto/doctor-availability-dto';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private url  = 'http://localhost:8080/appointment'; 

  constructor(private http: HttpClient) { }

  createAppointment(appointment: AppointmentDTORequest): Observable<AppointmentResponseDTO> {
    return this.http.post<AppointmentResponseDTO>(`${this.url}/create`, appointment);
  }

  updateAppointment(appointmentId: number, appointment: AppointmentDTORequest): Observable<AppointmentResponseDTO> {
    return this.http.patch<AppointmentResponseDTO>(`${this.url}/update/${appointmentId}`, appointment);
  }

  cancelAppointment(appointmentId: number): Observable<string> {
    return this.http.delete<string>(`${this.url}/cancel/${appointmentId}`);
  }

  getAppointmentById(appointmentId: number): Observable<AppointmentResponseDTO> {
    return this.http.get<AppointmentResponseDTO>(`${this.url}/findAppointment/${appointmentId}`);
  }

  getAppointmentsByClient(clientId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/client/${clientId}`);
  }

  uploadDoctorAvailability(doctorId: number, availability: DoctorAvailabilityDTO): Observable<string> {
    return this.http.post<string>(`${this.url}/uploadAvailability/${doctorId}`, availability);
  }

  getAppointmentsByPet(petId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/pet/${petId}`);
  }

  getAvailableAppointmentsDoctor(doctorId: number): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/doctor/${doctorId}`);
  }

  getAvailableAppointments(): Observable<AppointmentResponseDTO[]> {
    return this.http.get<AppointmentResponseDTO[]>(`${this.url}/available`);
  }
}