import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register-component/register-component';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './pages/login-component/login-component';
import { ClientHomePage } from './pages/client/client-home-page/client-home-page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // Rutas públicas (sin guard)
    { path: '', component: LandingComponent, data: { showHeader: true } },
    { path: 'login', component: LoginComponent, data: { showHeader: false } },
    { path: 'register', component: RegisterComponent, data: { showHeader: false } },
    
    // Rutas del CLIENT (protegidas con AuthGuard)
    { 
      path: 'client/home', 
      component: ClientHomePage, 
      data: { showHeader: false },
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
    
    // Rutas del ADMIN (cuando las crees)
    // { 
    //   path: 'admin/home', 
    //   component: AdminHomePage,
    //   canActivate: [authGuard]
    // },
  ];

