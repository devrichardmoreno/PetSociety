import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register-component/register-component';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './pages/login-component/login-component';
import { ClientHomePage } from './pages/client/client-home-page/client-home-page';
import { ClientAppointmentsComponent } from './pages/client/client-appointments/client-appointments';
import { ClientDiagnosesComponent } from './pages/client/client-diagnoses/client-diagnoses';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { AdminHome } from './pages/admin/admin-home/admin-home';
import { CreateAppointment } from './pages/admin/create-appointment/create-appointment';
import { AppointmentListComponent } from './pages/admin/admin-home/appointment-list/appointment-list';
import { DoctorHomePage } from './pages/doctor/doctor-home-page/doctor-home-page';
import { AppointmentDoctorHistory } from './pages/doctor/appointment-doctor-history/appointment-doctor-history';
import { AppointmentDetail } from './pages/admin/appointment-detail/appointment-detail';
import { DoctorListComponent } from './pages/doctor-list/doctor-list';
import { DoctorListInactiveComponent } from './pages/doctor-list-inactive/doctor-list-inactive';
import { ClientListComponent } from './pages/client-list/client-list';
import { ClientListInactiveComponent } from './pages/client-list-inactive/client-list-inactive';
import { AdminListComponent } from './pages/admin-list/admin-list';
import { AdminListInactiveComponent } from './pages/admin-list-inactive/admin-list-inactive';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile';
import { CreateDoctor } from './pages/create-doctor/create-doctor';
import { CreateAdmin } from './pages/create-admin/create-admin';
import { ClientFormComponent } from './pages/client-form/client-form';
import { PetFormComponent } from './pages/pet-form/pet-form';
import { ClientPetsListComponent } from './pages/admin/client-pets-list/client-pets-list';

export const routes: Routes = [
    // Rutas del ADMIN (protegidas con AuthGuard + RoleGuard)
    {
      path: 'admin/home', 
      component:AdminHome, 
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'admin/appointment/:id',
      component: AppointmentDetail,
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

    {
      path: 'register/new/doctor',
      component:CreateDoctor,
      data: { headerType: 'admin'},
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'register/new/doctor/:id',
      component:CreateDoctor,
      data: { headerType: 'admin'},
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },

    {
      path : 'register/new/admin',
      component:CreateAdmin,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },

    {path: 'doctor/list',
      component:DoctorListComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {path: 'doctor/list/inactive',
      component:DoctorListInactiveComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {path: 'client/list',
      component:ClientListComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {path: 'client/list/inactive',
      component:ClientListInactiveComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {path: 'admin/list',
      component:AdminListComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {path: 'admin/list/inactive',
      component:AdminListInactiveComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {path: 'admin/profile',
      component:AdminProfileComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'client/:clientId/pets',
      component: ClientPetsListComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'register/new/client/admin/:id',
      component: ClientFormComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'register/new/client/admin',
      component: ClientFormComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'pet/create/admin',
      component: PetFormComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'pet/create/admin/:id',
      component: PetFormComponent,
      data: { headerType: 'admin' },
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },


    // Rutas públicas (sin guard)
    { path: '', component: LandingComponent, data: { headerType: 'default' } },
    { path: 'login', component: LoginComponent, data: { headerType: 'none' } },
    { path: 'register', component: RegisterComponent, data: { headerType: 'none' } },
    { path: 'register/new/client', component: RegisterComponent, data: { headerType: 'none' } },
    
    // Rutas del CLIENT (protegidas con AuthGuard + RoleGuard)
    { 
      path: 'client/home', 
      component: ClientHomePage, 
      data: { headerType: 'client' },
      canActivate: [authGuard, roleGuard(['ROLE_CLIENT'])]
    },
    { 
      path: 'client/citas', 
      component: ClientAppointmentsComponent,
      data: { headerType: 'client' },
      canActivate: [authGuard, roleGuard(['ROLE_CLIENT'])]
    },
    { 
      path: 'client/diagnosticos', 
      component: ClientDiagnosesComponent,
      data: { headerType: 'client' },
      canActivate: [authGuard, roleGuard(['ROLE_CLIENT'])]
    },

    // Rutas del Doctor

    {
      path: 'doctor/home',
      component: DoctorHomePage,
      data: { headerType: 'doctor' },
      canActivate: [authGuard, roleGuard(['ROLE_DOCTOR'])]
    },

    {
      path: 'doctor/historial-citas',
      component: AppointmentDoctorHistory,
      data: { headerType: 'doctor' },
      canActivate: [authGuard, roleGuard(['ROLE_DOCTOR'])]
    }
    
    // Rutas del DOCTOR (cuando las crees)
    // { 
    //   path: 'doctor/home', 
    //   component: DoctorHomePage,
    //   canActivate: [authGuard]
    // },
    


  ];
