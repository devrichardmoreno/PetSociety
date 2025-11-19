import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Admin } from '../../models/entities/admin';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private url = 'http://localhost:8080/user';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllActiveAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.url}/admin/active`, {
      headers: this.getAuthHeaders()
    });
  }

  getAllInactiveAdmins(): Observable<Admin[]> {
    return this.http.get<Admin[]>(`${this.url}/admin/inactive`, {
      headers: this.getAuthHeaders()
    });
  }

  updateAdmin(adminId: number, admin: Admin): Observable<Admin> {
    return this.http.patch<Admin>(`${this.url}/update/${adminId}`, admin, {
      headers: this.getAuthHeaders()
    });
  }

  unsubscribeAdmin(adminId: number): Observable<string> {
    return this.http.patch<string>(`${this.url}/delete/${adminId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    });
  }

  reactivateAdmin(adminId: number): Observable<string> {
    return this.http.patch<string>(`${this.url}/resubscribe/${adminId}`, {}, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'
    });
  }

  getAdminById(adminId: number): Observable<Admin> {
    return this.http.get<Admin>(`${this.url}/${adminId}`, {
      headers: this.getAuthHeaders()
    });
  }
}

