import { inject, Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateFn } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';


/**
 * Guard que protege rutas que requieren autenticación
 * Si el usuario no está autenticado, lo redirige al login
 * y guarda la URL destino para redirigir después del login
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (authService.isAuthenticated()) {
    return true; // Permitir acceso
  }

  // Si no está autenticado, redirigir al login
  // Guardamos la URL a la que intentaba acceder para redirigir después del login
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  
  return false; // Bloquear acceso
};
