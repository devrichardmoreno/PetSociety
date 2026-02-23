import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../utils/error-handler';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email-component.html',
  styleUrls: ['./verify-email-component.css']
})
export class VerifyEmailComponent implements OnInit {
  token: string = '';
  isLoading = false;
  isVerified = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el token de los query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      if (this.token) {
        this.verifyEmail();
      }
    });
  }

  verifyEmail(): void {
    if (!this.token) {
      this.errorMessage = 'No se proporcionó un token de verificación.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyEmail(this.token).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isVerified = true;
        Swal.fire({
          icon: 'success',
          title: 'Email verificado',
          text: response.message,
          confirmButtonColor: '#45AEDD',
          confirmButtonText: 'Ir al login'
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.isVerified = false;
        const errorMessage = getFriendlyErrorMessage(error);
        this.errorMessage = errorMessage;
        Swal.fire({
          icon: 'error',
          title: 'Error al verificar email',
          text: errorMessage,
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
