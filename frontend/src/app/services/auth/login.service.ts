import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginDTO } from '../../models/dto/auth/login-dto';
import { LoginResponse } from '../../models/dto/auth/login-response';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  
  private url = 'http://localhost:8080/auth/login';

  constructor(private http: HttpClient) {}

  login(client: LoginDTO): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.url, client);
  }
}

