import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/auth/register/register-component';
import { LandingComponent } from './pages/auth/landing/landing-component';
import { LoginComponent } from './pages/auth/login/login-component';
import { ClientHomePage } from './pages/client/client-home-page/client-home-page';
import { ClientAppointmentsComponent } from './pages/client/client-appointments/client-appointments';
import { ClientDiagnosesComponent } from './pages/client/client-diagnoses/client-diagnoses';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { AdminHome } from './pages/admin/admin-home/admin-home';
import { CreateAppointment } from './pages/admin/appointments/create/create-appointment';
import { AppointmentListComponent } from './pages/admin/appointments/list/appointment-list';
import { DoctorHomePage } from './pages/doctor/doctor-home-page/doctor-home-page';
import { AppointmentDoctorHistory } from './pages/doctor/appointment-doctor-history/appointment-doctor-history';
import { AppointmentDetail } from './pages/admin/appointments/detail/appointment-detail';
import { DoctorListComponent } from './pages/admin/doctors/list/doctor-list';
import { DoctorListInactiveComponent } from './pages/admin/doctors/list-inactive/doctor-list-inactive';
import { ClientListComponent } from './pages/admin/clients/list/client-list';
import { ClientListInactiveComponent } from './pages/admin/clients/list-inactive/client-list-inactive';
import { AdminListComponent } from './pages/admin/admins/list/admin-list';
import { AdminListInactiveComponent } from './pages/admin/admins/list-inactive/admin-list-inactive';
import { AdminProfileComponent } from './pages/admin/profile/admin-profile';
import { DoctorFormComponent } from './pages/admin/doctors/form/doctor-form';
import { CreateAdmin } from './pages/admin/admins/create/create-admin';
import { ClientFormComponent } from './pages/admin/clients/form/client-form';
import { PetFormComponent } from './pages/admin/clients/pet-form/pet-form';
import { ClientPetsListComponent } from './pages/admin/clients/pets-list/client-pets-list';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password-component';
import { ResetPasswordComponent } from './pages/auth/reset-password/reset-password-component';
import { VerifyEmailComponent } from './pages/auth/verify-email/verify-email-component';
import { ChangeEmailComponent } from './pages/auth/change-email/change-email-component';

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
      component:DoctorFormComponent,
      data: { headerType: 'admin'},
      canActivate: [authGuard, roleGuard(['ROLE_ADMIN'])]
    },
    {
      path: 'register/new/doctor/:id',
      component:DoctorFormComponent,
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
    { path: 'forgot-password', component: ForgotPasswordComponent, data: { headerType: 'none' } },
    { path: 'reset-password', component: ResetPasswordComponent, data: { headerType: 'none' } },
    { path: 'verify-email', component: VerifyEmailComponent, data: { headerType: 'none' } },
    { path: 'change-email', component: ChangeEmailComponent, data: { headerType: 'none' } },
    
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
