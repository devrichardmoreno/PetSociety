import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PetDTO } from '../models/dto/PetDTO';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  
  private baseUrl = 'http://localhost:8080/pet';

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

  createPet(petDTO: PetDTO): Observable<PetDTO> {
    return this.http.post<PetDTO>(`${this.baseUrl}/create`, petDTO, {
      headers: this.getAuthHeaders()
    });
  }

  getPetById(petId: number): Observable<PetDTO> {
    return this.http.get<PetDTO>(`${this.baseUrl}/findByID/${petId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllPetsByClientId(clientId: number): Observable<PetDTO[]> {
    return this.http.get<PetDTO[]>(`${this.baseUrl}/findAllByClientId/${clientId}`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllPetsByClientIdIncludingInactive(clientId: number): Observable<PetDTO[]> {
    return this.http.get<PetDTO[]>(`${this.baseUrl}/findAllByClientIdIncludingInactive/${clientId}`, {
      headers: this.getAuthHeaders()
    });
  }

  deletePet(petId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteActive/${petId}`, { 
      headers: this.getAuthHeaders(),
      responseType: 'text' 
    }) as Observable<string>;
  }

  updatePet(petId: number, petDTO: PetDTO): Observable<PetDTO> {
    return this.http.patch<PetDTO>(`${this.baseUrl}/update/${petId}`, petDTO, {
      headers: this.getAuthHeaders()
    });
  }

  reactivatePet(petId: number): Observable<string> {
    return this.http.patch(`${this.baseUrl}/reactivate/${petId}`, null, {
      headers: this.getAuthHeaders(),
      responseType: 'text'
    }) as Observable<string>;
  }
}

