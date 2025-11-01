import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register-component/register-component';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './pages/login-component/login-component';
import { AdminHome } from './pages/admin/admin-home/admin-home';
import { CreateAppointment } from './pages/admin/create-appointment/create-appointment';

export const routes: Routes = [
    {path:'' , component: LandingComponent, data: { headerType: 'default' }},
    {path:'register', component: RegisterComponent, data: { headerType: 'none' }},
    {path: 'login', component:LoginComponent, data: { headerType: 'none' }},
    {path: 'admin/home', component:AdminHome, data: { headerType: 'admin' }},
    {path: 'appointment/create', component:CreateAppointment, data: { headerType: 'none'}}
];
