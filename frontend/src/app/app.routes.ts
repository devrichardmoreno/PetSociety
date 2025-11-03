import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register-component/register-component';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './pages/login-component/login-component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { DoctorHomePage } from './pages/doctor/doctor-home-page/doctor-home-page';

export const routes: Routes = [
    // Rutas del ADMIN (protegidas con AuthGuard + RoleGuard)
   /*  {
      path: 'admin/home', 
      component:AdminHome, 
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'appointment/create',
      component:CreateAppointment,
      data: { headerType: 'none' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },

    {
      path: 'appointment/list',
      component:AppointmentListComponent,
      data: { headerType: 'none' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
 */

    // Rutas públicas (sin guard)
    { path: '', component: LandingComponent, data: { headerType: 'default' } },
    { path: 'login', component: LoginComponent, data: { headerType: 'none' } },
    { path: 'register', component: RegisterComponent, data: { headerType: 'none' } },
    
    // Rutas del CLIENT (protegidas con AuthGuard + RoleGuard)
  /*   { 
      path: 'client/home', 
      component: ClientHomePage, 
      data: { headerType: 'client' },
      canActivate: [authGuard, roleGuard(['ROLE_CLIENT'])]
    }, */

    // Ruta del Doctor (protegida con AuthGuard + RoleGuard)
    {
        path: 'doctor/home',
        component: DoctorHomePage,
        data: { headerType: 'doctor' },
        canActivate: [authGuard, roleGuard(['ROLE_DOCTOR'])]
    }


  ];