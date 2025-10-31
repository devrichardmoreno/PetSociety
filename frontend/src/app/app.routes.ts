import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register-component/register-component';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './pages/login-component/login-component';
import { DoctorHomePage } from './pages/doctor/doctor-home-page/doctor-home-page';
export const routes: Routes = [
    {path:'' , component: LandingComponent, data: { showHeader: true }},
    {path:'register', component: RegisterComponent, data: { showHeader: false }},
    {path: 'login', component:LoginComponent, data: {showHeader: false} },
    {path: 'doctor/home', component: DoctorHomePage, data: {showHeader: false} }
];

