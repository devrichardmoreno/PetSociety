import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ClientDTO } from '../models/dto/ClientDTO';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  
  private baseUrl = 'http://localhost:8080/client';

  constructor(private http: HttpClient) {}

  getClientById(id: number): Observable<ClientDTO> {
    return this.http.get<ClientDTO>(`${this.baseUrl}/findById/${id}`);
  }

  updateClient(id: number, clientDTO: ClientDTO): Observable<ClientDTO> {
    return this.http.patch<ClientDTO>(`${this.baseUrl}/update/${id}`, clientDTO);
  }

  unsubscribeClient(id: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/unsubscribe/${id}`, { responseType: 'text' }) as Observable<string>;
  }
}

