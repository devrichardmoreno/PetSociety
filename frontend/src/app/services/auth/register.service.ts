import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterDTO } from '../../models/dto/auth/register-dto';
import { RegisterDoctorDTO } from '../../models/dto/doctor/register-doctor-dto';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  readonly API = 'http://localhost:8080/register';

  constructor(private http: HttpClient) {}

  registerClient(client: RegisterDTO) {
    return this.http.post(`${this.API}/new/client`, client);
  }

  registerDoctor(doctor: RegisterDoctorDTO) {
    return this.http.post(`${this.API}/new/doctor`, doctor, { responseType: 'text' });
  }

  registerAdmin(admin: RegisterDTO) {
    return this.http.post(`${this.API}/new/admin`, admin, { responseType: 'text' });
  }
}

