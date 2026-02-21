import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../utils/error-handler';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './forgot-password-component.html',
  styleUrls: ['./forgot-password-component.css']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  resetToken: string | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email')?.value;

    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Si el token viene en la respuesta (fallback si falla el email)
        if (response.resetToken) {
          this.resetToken = response.resetToken;
          Swal.fire({
            icon: 'warning',
            title: 'Email no enviado',
            html: `
              <p>${response.message}</p>
              <div style="margin-top: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 8px; word-break: break-all;">
                <strong>Tu token de recuperación:</strong><br>
                <code style="font-size: 14px; color: #45AEDD;">${response.resetToken}</code>
              </div>
              <p style="margin-top: 15px; font-size: 14px; color: #666;">
                Copiá este token y usalo en la siguiente pantalla para restablecer tu contraseña.
              </p>
            `,
            confirmButtonText: 'Ir a restablecer contraseña',
            confirmButtonColor: '#45AEDD',
            showCancelButton: true,
            cancelButtonText: 'Cerrar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/reset-password'], { 
                queryParams: { token: response.resetToken } 
              });
            }
          });
        } else {
          // Email enviado exitosamente
          Swal.fire({
            icon: 'success',
            title: 'Email enviado',
            html: `
              <p>${response.message}</p>
              <p style="margin-top: 15px; font-size: 14px; color: #666;">
                Revisá tu bandeja de entrada y seguí las instrucciones del email para restablecer tu contraseña.
              </p>
              <p style="margin-top: 10px; font-size: 12px; color: #999;">
                💡 Tip: Si no ves el email, revisá tu carpeta de spam.
              </p>
            `,
            confirmButtonText: 'Ir al login',
            confirmButtonColor: '#45AEDD',
            showCancelButton: true,
            cancelButtonText: 'Cerrar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/login']);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = getFriendlyErrorMessage(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  copyToken(): void {
    if (this.resetToken) {
      navigator.clipboard.writeText(this.resetToken).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Token copiado',
          text: 'El token fue copiado al portapapeles',
          timer: 2000,
          showConfirmButton: false
        });
      });
    }
  }
}
