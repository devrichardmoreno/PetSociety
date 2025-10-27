import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing-component/landing-component';
import { LoginComponent } from './pages/login-component/login-component';

export const routes: Routes = [
    {path: '', component:LandingComponent, data: {showHeader: true}},
    {path: 'login', component:LoginComponent, data: {showHeader: false} }
];
