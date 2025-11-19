import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-component',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing-component.html',
  styleUrl: './landing-component.css'
})
export class LandingComponent implements OnInit {
  isAuthenticated: boolean = false;
  userRole: string | null = null;
  username: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.userRole = this.authService.getUserRole();
      this.username = this.authService.getUsername();
    }
  }

  goToUserMenu(): void {
    if (!this.userRole) return;

    switch(this.userRole) {
      case 'ROLE_CLIENT':
        this.router.navigate(['/client/home']);
        break;
      case 'ROLE_ADMIN':
        this.router.navigate(['/admin/home']);
        break;
      case 'ROLE_DOCTOR':
        this.router.navigate(['/doctor/home']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  goToScheduleAppointment(): void {
    if (!this.isAuthenticated || !this.userRole) {
      // Si no está logueado, ir al login
      this.router.navigate(['/login']);
      return;
    }

    // Si está logueado, redirigir según el rol
    switch(this.userRole) {
      case 'ROLE_CLIENT':
        this.router.navigate(['/client/home']);
        break;
      case 'ROLE_ADMIN':
        this.router.navigate(['/appointment/create']);
        break;
      case 'ROLE_DOCTOR':
        this.router.navigate(['/doctor/home']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  getButtonText(): string {
    if (!this.userRole) return 'Agendar Cita';
    
    switch(this.userRole) {
      case 'ROLE_CLIENT':
        return 'Ir a mi cuenta';
      case 'ROLE_ADMIN':
        return 'Ir a panel de Administrador';
      case 'ROLE_DOCTOR':
        return 'Ir a panel de Doctor';
      default:
        return 'Agendar Cita';
    }
  }
}
