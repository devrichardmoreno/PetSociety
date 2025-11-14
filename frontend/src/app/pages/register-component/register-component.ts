import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RegisterService } from '../../services/register-service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  constructor(
    private registerService: RegisterService,
    private route: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.passwordValidator]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(20)]],
      dni: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8)]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Verificar si hay una sesión activa
    if (this.authService.isAuthenticated()) {
      const username = this.authService.getUsername();
      this.showActiveSessionModal(username);
    }
  }

  showActiveSessionModal(username: string | null): void {
    const userRole = this.authService.getUserRole();
    let roleLabel = 'usuario';
    let menuRoute = '/login';

    switch(userRole) {
      case 'ROLE_CLIENT':
        roleLabel = 'Cliente';
        menuRoute = '/client/home';
        break;
      case 'ROLE_ADMIN':
        roleLabel = 'Administrador';
        menuRoute = '/admin/home';
        break;
      case 'ROLE_DOCTOR':
        roleLabel = 'Doctor';
        menuRoute = '/doctor/home';
        break;
    }

    Swal.fire({
      title: 'Sesión activa',
      html: `<p>Ya tienes una sesión activa como <strong>${username}</strong> (${roleLabel}).</p>`,
      icon: 'info',
      showCancelButton: false,
      showDenyButton: true,
      confirmButtonText: 'Ir a mi cuenta',
      denyButtonText: 'Cerrar sesión',
      allowOutsideClick: false,
      allowEscapeKey: false,
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#F47B20',
      denyButtonColor: '#d33',
      iconColor: '#F47B20'
    }).then((result) => {
      if (result.isConfirmed) {
        // Ir al menú del usuario
        this.route.navigate([menuRoute]);
      } else if (result.isDenied) {
        // Cerrar sesión
        this.authService.logout();
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#fff',
          color: '#333'
        });
      }
    });
  }

  // Validador personalizado para contraseña
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null; // Dejamos que Validators.required maneje el caso vacío
    }

    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    if (!hasLetter || !hasNumber) {
      return { passwordStrength: true };
    }

    return null;
  }

  // Métodos para verificar cada validación individualmente
  hasMinLength(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return password.length >= 8;
  }

  hasLetter(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[a-zA-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasMaxLength(): boolean {
    const password = this.registerForm.get('password')?.value || '';
    return password.length <= 50;
  }

onSubmit() {
    // Marcar todos los campos como touched para mostrar los errores
    if (this.registerForm.invalid) {
      // Marcar todos los controles como touched
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control) {
          control.markAsTouched();
          control.markAsDirty();
        }
      });
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos requeridos correctamente',
        background: '#fff',
        color: '#333', 
        confirmButtonColor: '#F47B20', 
        iconColor: '#000000'
      });
      return;
    }

    this.registerService.registerClient(this.registerForm.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada!',
          text: 'Bienvenido a Pet Society 💙🐾',
          background: '#fff', 
          color: '#333', 
          confirmButtonText: 'Ir al login',
          confirmButtonColor: '#F47B20', 
          iconColor: '#7AC143',
          customClass: {
            popup: 'animate__animated animate__fadeInDown'
          }
        }).then(() => {
          this.route.navigate(['/login']);
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear la cuenta',
          text: `Ocurrió un problema: ${error.message || error.statusText || 'Error desconocido'}`,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20', 
          iconColor: '#000000'
        });
      }
    });
  }
}
