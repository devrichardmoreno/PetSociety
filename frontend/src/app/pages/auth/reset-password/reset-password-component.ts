import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../utils/error-handler';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './reset-password-component.html',
  styleUrls: ['./reset-password-component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  token: string = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener el token de los query params
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });

    this.resetPasswordForm = this.fb.group({
      token: [this.token, [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });

    // Si el token viene en la URL, actualizar el campo
    if (this.token) {
      this.resetPasswordForm.patchValue({ token: this.token });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    this.isLoading = true;
    const token = this.resetPasswordForm.get('token')?.value;
    const newPassword = this.resetPasswordForm.get('newPassword')?.value;

    this.authService.resetPassword(token, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Contraseña restablecida',
          text: response.message,
          confirmButtonColor: '#45AEDD',
          confirmButtonText: 'Ir al login'
        }).then(() => {
          this.router.navigate(['/login']);
        });
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
}
