import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientDTO } from '../models/dto/ClientDTO';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  
  private baseUrl = 'http://localhost:8080/client';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getClientById(id: number): Observable<ClientDTO> {
    return this.http.get<ClientDTO>(`${this.baseUrl}/findById/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  updateClient(id: number, clientDTO: ClientDTO): Observable<ClientDTO> {
    return this.http.patch<ClientDTO>(`${this.baseUrl}/update/${id}`, clientDTO, {
      headers: this.getAuthHeaders()
    });
  }

  unsubscribeClient(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/unsubscribe/${id}`, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' 
    }) as Observable<string>;
  }

  getAllClientsEntity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list-id`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllActiveClientsWithPetsCount(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list-id/active`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllInactiveClientsWithPetsCount(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/list-id/inactive`, {
      headers: this.getAuthHeaders()
    });
  }

  reactivateClient(id: number): Observable<string> {
    return this.http.patch(`${this.baseUrl}/reactivate/${id}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }) as Observable<string>;
  }
}

