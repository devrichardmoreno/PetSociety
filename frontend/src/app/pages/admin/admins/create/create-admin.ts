import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { RegisterService } from '../../../../services/auth/register.service';
import { RegisterDTO } from '../../../../models/dto/auth/register-dto';
import { nameValidator, phoneValidator, dniValidator, usernameExistsValidator } from '../../../../utils/form-validators';
import { capitalizeProperNames } from '../../../../utils/text';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-create-admin',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './create-admin.html',
  styleUrls: ['./create-admin.css']
})
export class CreateAdmin implements OnInit {

  adminForm!: FormGroup;

  constructor(
    private registerService: RegisterService,
    private route: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.adminForm = this.fb.group({
      username: ['', 
        [Validators.required], 
        [usernameExistsValidator((username: string) => this.authService.checkUsernameExists(username))]
      ],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.passwordValidator]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      phone: ['', [Validators.required, phoneValidator()]],
      dni: ['', [Validators.required, dniValidator()]],
      email: ['', [Validators.required, Validators.email]]
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
    const password = this.adminForm.get('password')?.value || '';
    return password.length >= 8;
  }

  hasLetter(): boolean {
    const password = this.adminForm.get('password')?.value || '';
    return /[a-zA-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.adminForm.get('password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasMaxLength(): boolean {
    const password = this.adminForm.get('password')?.value || '';
    return password.length <= 50;
  }

  onSubmit() {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
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

    // Capitalizar nombres propios antes de enviar
    const formValue = { ...this.adminForm.value };
    const capitalized = capitalizeProperNames(formValue.name, formValue.surname);
    formValue.name = capitalized.name;
    formValue.surname = capitalized.surname;

    const adminData: RegisterDTO = formValue;

    this.registerService.registerAdmin(adminData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Administrador creado!',
          text: 'El administrador fue registrado con éxito',
          background: '#fff',
          color: '#333',
          confirmButtonText: 'Volver al panel',
          confirmButtonColor: '#F47B20',
          iconColor: '#7AC143',
          customClass: {
            popup: 'animate__animated animate__fadeInDown'
          }
        }).then(() => {
          this.route.navigate(['/admin/home']);
        });
      },
      error: (error) => {
        console.error('Error completo:', error); // Para debugging
        
        let errorMessage = 'Error desconocido';
        
        // Cuando hay un error HTTP, Angular intenta parsear el error como JSON
        // El backend devuelve ProblemDetail en formato JSON con estructura:
        // { type: "...", title: "...", status: 409, detail: "...", instance: "..." }
        if (error.error) {
          // Si error.error es un objeto (ProblemDetail)
          if (typeof error.error === 'object') {
            // Intentar leer el campo 'detail' del ProblemDetail
            if (error.error.detail) {
              errorMessage = error.error.detail;
            } 
            // Si no tiene 'detail', intentar leer 'title'
            else if (error.error.title) {
              errorMessage = error.error.title;
            }
            // Si es un objeto pero no tiene campos conocidos, convertir a string
            else {
              errorMessage = JSON.stringify(error.error);
            }
          } 
          // Si error.error es un string
          else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
        }
        
        // Si es un error 409 (Conflict), probablemente es porque el usuario ya existe
        if (error.status === 409) {
          if (errorMessage === 'Error desconocido' || errorMessage.includes('409')) {
            errorMessage = 'El nombre de usuario ya existe. Por favor, elegí otro.';
          }
        }
        
        // Fallback a otros campos del error solo si no tenemos un mensaje útil
        if (errorMessage === 'Error desconocido' || errorMessage.includes('Http failure')) {
          if (error.message && !error.message.includes('Http failure')) {
            errorMessage = error.message;
          } else if (error.statusText && error.statusText !== 'OK') {
            errorMessage = error.statusText;
          }
        }

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar el administrador',
          text: errorMessage,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20',
          iconColor: '#000000'
        });
      }
    });
  }
}
