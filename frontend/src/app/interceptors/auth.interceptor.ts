import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';


/**
 * Interceptor que agrega automáticamente el token JWT a todas las peticiones HTTP
 * y maneja errores de autenticación (401, token expirado, etc.)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Rutas públicas que NO requieren token
  const publicRoutes = ['/auth/login', '/register/new/client', '/register/new/admin', '/register/new/doctor'];
  const isPublicRoute = publicRoutes.some(route => req.url.includes(route));

  // Si es una ruta pública, no agregar el token
  if (isPublicRoute) {
    return next(req);
  }

  // Obtener el token
  const token = authService.getToken();

  // Si no hay token, continuar sin agregarlo (el backend rechazará si es necesario)
  if (!token) {
    return next(req);
  }

  // Clonar la request y agregar el header Authorization
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  // Enviar la petición y manejar errores
  return next(clonedRequest).pipe(
    catchError((error) => {
      // Si el token expiró o es inválido (401 Unauthorized)
      if (error.status === 401) {
        // Limpiar datos de autenticación
        authService.logout();
        // Redirigir al login
        router.navigate(['/login']);
      }
      // Re-lanzar el error para que el componente lo maneje
      return throwError(() => error);
    })
  );
};
