import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard = (allowedRoles: string[]) => {
  const guard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Primero verificamos que esté autenticado
    if (!authService.isAuthenticated()) {
      router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Luego verificamos que tenga uno de los roles permitidos
    const userRole = authService.getUserRole();
    
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Si no tiene el rol permitido, redirigir al home según su rol
      switch(userRole) {
        case 'ROLE_CLIENT':
          router.navigate(['/client/home']);
          break;
        case 'ROLE_ADMIN':
          router.navigate(['/admin/home']);
          break;
        case 'ROLE_DOCTOR':
          router.navigate(['/doctor/home']);
          break;
        default:
          router.navigate(['/login']);
      }
      return false;
    }

    return true;
  };

  return guard;
};

