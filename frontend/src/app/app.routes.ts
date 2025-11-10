import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register-component/register-component';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './pages/login-component/login-component';
import { ClientHomePage } from './pages/client/client-home-page/client-home-page';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { AdminHome } from './pages/admin/admin-home/admin-home';
import { CreateAppointment } from './pages/admin/create-appointment/create-appointment';
import { AppointmentListComponent } from './pages/admin/admin-home/appointment-list/appointment-list';
import { DoctorHomePage } from './pages/doctor/doctor-home-page/doctor-home-page';
import { DoctorListComponent } from './pages/doctor-list/doctor-list';

export const routes: Routes = [
    // Rutas del ADMIN (protegidas con AuthGuard + RoleGuard)
    {
      path: 'admin/home', 
      component:AdminHome, 
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'appointment/create',
      component:CreateAppointment,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },

    {
      path: 'appointment/list',
      component:AppointmentListComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },

    {path: 'doctor/list',
      component:DoctorListComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },


    // Rutas públicas (sin guard)
    { path: '', component: LandingComponent, data: { headerType: 'default' } },
    { path: 'login', component: LoginComponent, data: { headerType: 'none' } },
    { path: 'register', component: RegisterComponent, data: { headerType: 'none' } },
    
    // Rutas del CLIENT (protegidas con AuthGuard + RoleGuard)
    { 
      path: 'client/home', 
      component: ClientHomePage, 
      data: { headerType: 'client' },
      canActivate: [authGuard, roleGuard(['ROLE_CLIENT'])]
    },

    // Rutas del Doctor

    {
      path: 'doctor/home',
      component: DoctorHomePage,
      data: { headerType: 'doctor' },
      canActivate: [authGuard, roleGuard(['ROLE_DOCTOR'])]
    }
    // { 
    //   path: 'client/citas', 
    //   component: CitasComponent,
    //   canActivate: [authGuard]
    // }, // Futuro
    // { 
    //   path: 'client/diagnosticos', 
    //   component: DiagnosticosComponent,
    //   canActivate: [authGuard]
    // }, // Futuro
    
    // Rutas del DOCTOR (cuando las crees)
    // { 
    //   path: 'doctor/home', 
    //   component: DoctorHomePage,
    //   canActivate: [authGuard]
    // },
    


  ];