import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PetDTO } from '../models/dto/PetDTO';

@Injectable({
  providedIn: 'root'
})
export class PetService {
  
  private baseUrl = 'http://localhost:8080/pet';

  constructor(private http: HttpClient) {}

  createPet(petDTO: PetDTO): Observable<PetDTO> {
    return this.http.post<PetDTO>(`${this.baseUrl}/create`, petDTO);
  }

  getAllPetsByClientId(clientId: number): Observable<PetDTO[]> {
    return this.http.get<PetDTO[]>(`${this.baseUrl}/findAllByClientId/${clientId}`);
  }

  deletePet(petId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteActive/${petId}`, { responseType: 'text' }) as Observable<string>;
  }

  updatePet(petId: number, petDTO: PetDTO): Observable<PetDTO> {
    return this.http.patch<PetDTO>(`${this.baseUrl}/update/${petId}`, petDTO);
  }
}

