import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register-component/register-component';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './pages/login-component/login-component';
import { ClientHomePage } from './pages/client/client-home-page/client-home-page';
import { authGuard } from './guards/auth.guard';
import { AdminHome } from './pages/admin/admin-home/admin-home';
import { CreateAppointment } from './pages/admin/create-appointment/create-appointment';

export const routes: Routes = [
    // Rutas del ADMIN (cuando las crees)
    {
      path: 'admin/home', 
      component:AdminHome, 
      data: { headerType: 'admin' },
      canActivate: [authGuard]
    },
    {
      path: 'appointment/create',
      component:CreateAppointment,
      data: { headerType: 'none' },
      canActivate: [authGuard]
    },


    // Rutas públicas (sin guard)
    { path: '', component: LandingComponent, data: { headerType: 'default' } },
    { path: 'login', component: LoginComponent, data: { headerType: 'none' } },
    { path: 'register', component: RegisterComponent, data: { headerType: 'none' } },
    
    // Rutas del CLIENT (protegidas con AuthGuard)
    { 
      path: 'client/home', 
      component: ClientHomePage, 
      data: { headerType: 'client' },
      canActivate: [authGuard]
    },
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