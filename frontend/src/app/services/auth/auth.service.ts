import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private readonly API_URL = 'http://localhost:8080/auth';

  constructor(private http: HttpClient) {}

  private readonly TOKEN_KEY = 'token';
  private readonly USER_ROLE_KEY = 'userRole';
  private readonly USER_ID_KEY = 'userId';

  /**
   * Guarda los datos de autenticación después de un login exitoso
   * @param token - El token JWT recibido del backend
   * @param userId - El ID del usuario
   */
  saveAuthData(token: string, userId: number): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_ID_KEY, userId.toString());
    this.decodeTokenAndSaveRole(token);
  }

  /**
   * Obtiene el token guardado en localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene el rol del usuario guardado en localStorage
   */
  getUserRole(): string | null {
    return localStorage.getItem(this.USER_ROLE_KEY);
  }

  /**
   * Obtiene el ID del usuario guardado en localStorage
   */
  getUserId(): number | null {
    const userId = localStorage.getItem(this.USER_ID_KEY);
    return userId ? parseInt(userId, 10) : null;
  }

  /**
   * Verifica si el usuario está autenticado
   * Retorna true si hay un token y no está expirado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired();
  }

  /**
   * Obtiene el username del token JWT
   */
  getUsername(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      return payload?.sub || null;
    } catch (error) {
      console.error('Error al extraer username del token:', error);
      return null;
    }
  }

  /**
   * Decodifica el token JWT y extrae el rol, guardándolo en localStorage
   * @param token - El token JWT completo
   */
  decodeTokenAndSaveRole(token: string): void {
    try {
      // Dividir el token en sus 3 partes (header.payload.signature)
      const payloadBase64 = token.split('.')[1];
      
      // Decodificar de Base64 a string JSON
      const payloadJson = atob(payloadBase64);
      
      // Convertir el string JSON a objeto JavaScript
      const payload = JSON.parse(payloadJson);

      // Extraer el array de roles
      const rolesArray = payload.role;

      // Verificar que el rol existe y es un array válido
      if (rolesArray && Array.isArray(rolesArray) && rolesArray.length > 0) {
        const userRole = rolesArray[0].authority;
        localStorage.setItem(this.USER_ROLE_KEY, userRole);
      } else {
        console.warn('No se encontró un rol válido en el token');
      }
    } catch (error) {
      console.error('Error al decodificar el token:', error);
    }
  }

  /**
   * Verifica si el token está expirado
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      
      // El payload tiene 'exp' que es un timestamp en segundos
      const expirationTime = payload.exp * 1000; // Convertir a milisegundos
      const currentTime = new Date().getTime();
      
      return currentTime >= expirationTime;
    } catch (error) {
      console.error('Error al verificar expiración del token:', error);
      return true; // Si hay error, considerar expirado por seguridad
    }
  }

  /**
   * Decodifica el token completo y retorna el payload
   * Método privado auxiliar para uso interno
   */
  private decodeToken(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson);
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }

  /**
   * Limpia todos los datos de autenticación (logout)
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_ROLE_KEY);
    localStorage.removeItem(this.USER_ID_KEY);
  }

  /**
   * Verifica si un username ya existe
   */
  checkUsernameExists(username: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.API_URL}/check-username`, {
      params: { username }
    }).pipe(
      map(response => response.exists)
    );
  }

  /**
   * Verifica si un DNI ya existe
   */
  checkDniExists(dni: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.API_URL}/check-dni`, {
      params: { dni }
    }).pipe(
      map(response => response.exists)
    );
  }

  /**
   * Verifica si un email ya existe
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.API_URL}/check-email`, {
      params: { email }
    }).pipe(
      map(response => response.exists)
    );
  }

  /**
   * Verifica si un teléfono ya existe
   */
  checkPhoneExists(phone: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.API_URL}/check-phone`, {
      params: { phone }
    }).pipe(
      map(response => response.exists)
    );
  }

  /**
   * Solicita un token de recuperación de contraseña
   */
  forgotPassword(email: string): Observable<{ resetToken: string; message: string }> {
    return this.http.post<{ resetToken: string; message: string }>(`${this.API_URL}/forgot-password`, { email });
  }

  /**
   * Restablece la contraseña usando el token
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/reset-password`, { 
      token, 
      newPassword 
    });
  }

  /**
   * Verifica el email usando el token de verificación
   */
  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${this.API_URL}/verify-email`, {
      params: { token }
    });
  }

  /**
   * Cambiar email para cuenta aún no verificada (ej. se equivocó al registrarse)
   */
  changeEmailUnverified(username: string, password: string, newEmail: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API_URL}/change-email-unverified`, {
      username,
      password,
      newEmail
    });
  }
}

