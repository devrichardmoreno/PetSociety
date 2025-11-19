import { Component, OnInit, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { AdminService } from '../../../services/admin/admin.service';
import { Admin } from '../../../models/entities/admin';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header-admin.html',
  styleUrl: './header-admin.css'
})
export class HeaderAdmin implements OnInit {
  currentAdmin: Admin | null = null;
  showAccountDropdown: boolean = false;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentAdmin();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const accountDropdown = target.closest('.account-dropdown');
    if (!accountDropdown && this.showAccountDropdown) {
      this.closeAccountDropdown();
    }
  }

  loadCurrentAdmin(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.adminService.getAdminById(userId).subscribe({
        next: (admin: Admin) => {
          this.currentAdmin = admin;
        },
        error: (error) => {
          console.error('Error al cargar datos del administrador:', error);
        }
      });
    }
  }

  toggleAccountDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showAccountDropdown = !this.showAccountDropdown;
  }

  closeAccountDropdown(): void {
    this.showAccountDropdown = false;
  }

  logout(): void {
    this.closeAccountDropdown();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
