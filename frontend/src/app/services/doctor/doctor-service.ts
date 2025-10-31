import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {
  private url = 'http://localhost:8080/doctor';
}
