import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RegisterClientDTO } from '../../models/dto/register-client-dto';
import { AuthService } from '../../services/auth.service';
import { ClientService } from '../../services/client.service';
import { ClientDTO } from '../../models/dto/ClientDTO';
import Swal from 'sweetalert2';
import { nameValidator, phoneValidator, dniValidator, capitalizeProperNames, usernameExistsValidator } from '../../utils/form-validators';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './client-form.html',
  styleUrls: ['./client-form.css'],
})
export class ClientFormComponent implements OnInit {

  clientForm!: FormGroup;
  isEditMode: boolean = false;
  clientId?: number;
  private apiUrl = 'http://localhost:8080/register/new/client/admin';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.clientId = +id;
    }

    // Crear formulario con validaciones condicionales
    const formControls: any = {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      dni: ['', [Validators.required, dniValidator()]],
      phone: ['', [Validators.required, phoneValidator()]],
      email: ['', [Validators.required, Validators.email]]
    };

    // Solo agregar username, password y foundation si NO estamos en modo edición
    if (!this.isEditMode) {
      formControls.username = ['', 
        [Validators.required], 
        [usernameExistsValidator((username: string) => this.authService.checkUsernameExists(username))]
      ];
      formControls.password = ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.passwordValidator]];
      formControls.foundation = [false, Validators.required];
    }

    this.clientForm = this.fb.group(formControls);

    // Cargar datos del cliente después de crear el formulario
    if (this.isEditMode && this.clientId) {
      this.loadClientData(this.clientId);
    }
  }

  loadClientData(id: number): void {
    this.clientService.getClientById(id).subscribe({
      next: (client: ClientDTO) => {
        this.clientForm.patchValue({
          name: client.name,
          surname: client.surname,
          dni: client.dni,
          phone: client.phone,
          email: client.email
        });
      },
      error: (error) => {
        console.error('Error al cargar datos del cliente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos del cliente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20',
          iconColor: '#000000'
        });
        this.router.navigate(['/client/list']);
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
    const password = this.clientForm.get('password')?.value || '';
    return password.length >= 8;
  }

  hasLetter(): boolean {
    const password = this.clientForm.get('password')?.value || '';
    return /[a-zA-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.clientForm.get('password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasMaxLength(): boolean {
    const password = this.clientForm.get('password')?.value || '';
    return password.length <= 50;
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos requeridos',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#F47B20',
        iconColor: '#000000'
      });
      this.clientForm.markAllAsTouched();
      return;
    }

    // Capitalizar nombres propios antes de enviar
    const formValue = { ...this.clientForm.value };
    const capitalized = capitalizeProperNames(formValue.name, formValue.surname);
    formValue.name = capitalized.name;
    formValue.surname = capitalized.surname;

    const token = this.authService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    if (this.isEditMode && this.clientId) {
      // Modo edición: actualizar cliente existente
      const clientDTO: ClientDTO = {
        name: formValue.name,
        surname: formValue.surname,
        dni: formValue.dni,
        phone: formValue.phone,
        email: formValue.email
      };

      this.clientService.updateClient(this.clientId, clientDTO).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '✅ Cliente actualizado con éxito',
            text: 'Los datos del cliente fueron actualizados correctamente.',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20',
            iconColor: '#7AC143'
          }).then(() => {
            this.router.navigate(['/client/list']);
          });
        },
        error: (error) => {
          console.error('❌ Error al actualizar el cliente:', error);
          let errorMessage = 'Ocurrió un problema al actualizar el cliente.';
          
          if (error.error) {
            if (typeof error.error === 'object' && error.error.detail) {
              errorMessage = error.error.detail;
            } else if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }

          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar el cliente',
            text: errorMessage,
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20',
            iconColor: '#000000'
          });
        }
      });
    } else {
      // Modo creación: registrar nuevo cliente
      const newClient: RegisterClientDTO = formValue;

      this.http.post(this.apiUrl, newClient, { headers, responseType: 'text' })
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '✅ Cliente registrado con éxito',
              text: 'El nuevo cliente fue agregado correctamente.',
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#F47B20',
              iconColor: '#7AC143'
            });
            this.clientForm.reset();
          },
          error: (error) => {
            console.error('❌ Error al registrar el cliente:', error);
            let errorMessage = 'Ocurrió un problema al registrar el cliente.';
            
            // Manejo específico para username duplicado (409 CONFLICT)
            if (error.status === 409) {
              if (error.error) {
                if (typeof error.error === 'object' && error.error.detail) {
                  errorMessage = error.error.detail;
                } else if (typeof error.error === 'string') {
                  errorMessage = error.error;
                } else {
                  errorMessage = 'El nombre de usuario ya existe. Por favor, elegí otro.';
                }
              } else {
                errorMessage = 'El nombre de usuario ya existe. Por favor, elegí otro.';
              }
            } else if (error.error) {
              if (typeof error.error === 'object') {
                if (error.error.detail) {
                  errorMessage = error.error.detail;
                } else if (error.error.message) {
                  errorMessage = error.error.message;
                }
              } else if (typeof error.error === 'string') {
                errorMessage = error.error;
              }
            } else if (error.message) {
              errorMessage = error.message;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error al registrar el cliente',
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
}

