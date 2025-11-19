import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './default-header.html',
  styleUrl: './default-header.css'
})
export class Header implements OnInit {
  isMenuOpen = false;
  isAuthenticated: boolean = false;
  userRole: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      this.userRole = this.authService.getUserRole();
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
    this.toggleMenu(); // Cerrar el menú móvil si está abierto
  }

  getButtonText(): string {
    if (!this.userRole) return 'Ir a mi cuenta';
    
    switch(this.userRole) {
      case 'ROLE_CLIENT':
        return 'Ir a mi cuenta';
      case 'ROLE_ADMIN':
        return 'Ir a panel de Administrador';
      case 'ROLE_DOCTOR':
        return 'Ir a panel de Doctor';
      default:
        return 'Ir a mi cuenta';
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas cerrar sesión?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#999',
      iconColor: '#45aedd'
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout();
        // Actualizar el estado de autenticación
        this.isAuthenticated = false;
        this.userRole = null;
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#fff',
          color: '#333'
        }).then(() => {
          this.router.navigate(['/']);
        });
      }
    });
  }
}
