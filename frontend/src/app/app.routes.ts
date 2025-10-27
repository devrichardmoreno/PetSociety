import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register-component/register-component';
import { LandingComponent } from './pages/landing-component/landing-component';

export const routes: Routes = [
    {path:'' , component: LandingComponent, data: { showHeader: true }},
    {path:'register', component: RegisterComponent, data: { showHeader: false }}
];
