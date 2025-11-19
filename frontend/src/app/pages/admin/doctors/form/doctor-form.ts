import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Speciality } from '../../../../models/enums/speciality.enum';
import { DoctorService } from '../../../../services/doctor/doctor.service';
import { Doctor } from '../../../../models/entities/doctor';
import Swal from 'sweetalert2';
import { nameValidator, phoneValidator, dniValidator, usernameExistsValidator } from '../../../../utils/form-validators';
import { capitalizeProperNames } from '../../../../utils/text';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-doctor-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './doctor-form.html',
  styleUrls: ['./doctor-form.css'],
})
export class DoctorFormComponent implements OnInit {

  doctorForm!: FormGroup;
  specialities = Object.values(Speciality);
  isEditMode: boolean = false;
  doctorId: number | null = null;

  private apiUrl = 'http://localhost:8080/register/new/doctor';

  getSpecialityLabel(speciality: Speciality): string {
    const labels: { [key in Speciality]: string } = {
      [Speciality.GENERAL_MEDICINE]: 'Medicina General',
      [Speciality.INTERNAL_MEDICINE]: 'Medicina Interna',
      [Speciality.NUTRITION]: 'Nutrición'
    };
    return labels[speciality] || speciality;
  }

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.doctorId = +id;
    }

    // Crear formulario con validaciones condicionales
    const formControls: any = {
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      dni: ['', [Validators.required, dniValidator()]],
      phone: ['', [Validators.required, phoneValidator()]],
      email: ['', [Validators.required, Validators.email]],
      speciality: [null, Validators.required],
    };

    // Solo agregar username y password si NO estamos en modo edición
    if (!this.isEditMode) {
      formControls.username = ['', 
        [Validators.required], 
        [usernameExistsValidator((username: string) => this.authService.checkUsernameExists(username))]
      ];
      formControls.password = ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.passwordValidator]];
    }

    this.doctorForm = this.fb.group(formControls);

    // Cargar datos del doctor después de crear el formulario
    if (this.isEditMode && this.doctorId) {
      this.loadDoctorData(this.doctorId);
    }
  }

  loadDoctorData(id: number): void {
    this.doctorService.getDoctorById(id).subscribe({
      next: (doctor: Doctor) => {
        this.doctorForm.patchValue({
          name: doctor.name,
          surname: doctor.surname,
          dni: doctor.dni,
          phone: doctor.phone,
          email: doctor.email,
          speciality: doctor.speciality
        });
      },
      error: (error) => {
        console.error('Error al cargar datos del doctor:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos del doctor.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20',
          iconColor: '#000000'
        });
        this.router.navigate(['/doctor/list']);
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
    const password = this.doctorForm.get('password')?.value || '';
    return password.length >= 8;
  }

  hasLetter(): boolean {
    const password = this.doctorForm.get('password')?.value || '';
    return /[a-zA-Z]/.test(password);
  }

  hasNumber(): boolean {
    const password = this.doctorForm.get('password')?.value || '';
    return /[0-9]/.test(password);
  }

  hasMaxLength(): boolean {
    const password = this.doctorForm.get('password')?.value || '';
    return password.length <= 50;
  }

  onSubmit(): void {
    if (this.doctorForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos requeridos',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#F47B20',
        iconColor: '#000000'
      });
      this.doctorForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode) {
      // Mostrar pop-up de confirmación con los datos del doctor
      const formData = this.doctorForm.value;
      const specialityLabel = this.getSpecialityLabel(formData.speciality);
      
      Swal.fire({
        title: '¿Confirmar cambios?',
        html: `
          <div style="text-align: left; padding: 1rem;">
            <p style="margin: 0.5rem 0;"><strong>Nombre:</strong> ${formData.name}</p>
            <p style="margin: 0.5rem 0;"><strong>Apellido:</strong> ${formData.surname}</p>
            <p style="margin: 0.5rem 0;"><strong>DNI:</strong> ${formData.dni}</p>
            <p style="margin: 0.5rem 0;"><strong>Teléfono:</strong> ${formData.phone}</p>
            <p style="margin: 0.5rem 0;"><strong>Email:</strong> ${formData.email}</p>
            <p style="margin: 0.5rem 0;"><strong>Especialidad:</strong> ${specialityLabel}</p>
          </div>
          <p style="margin-top: 1rem; font-weight: 600;">¿Estás seguro de que querés confirmar estos cambios?</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#F47B20',
        cancelButtonColor: '#6c757d',
        background: '#fff',
        color: '#333',
        iconColor: '#F47B20',
        reverseButtons: true,
        buttonsStyling: true
      }).then((result) => {
        if (result.isConfirmed) {
          // Actualizar doctor en el backend
          if (this.doctorId) {
            // Capitalizar nombres propios antes de enviar
            const capitalized = capitalizeProperNames(formData.name, formData.surname);
            const doctorData: Doctor = {
              name: capitalized.name,
              surname: capitalized.surname,
              dni: formData.dni,
              phone: formData.phone,
              email: formData.email,
              speciality: formData.speciality
            };

            this.doctorService.updateDoctor(this.doctorId, doctorData).subscribe({
              next: () => {
                // Mostrar animación de éxito
                Swal.fire({
                  icon: 'success',
                  title: '¡Cambios guardados!',
                  text: 'Los datos del doctor fueron actualizados correctamente.',
                  background: '#fff',
                  color: '#333',
                  confirmButtonColor: '#F47B20',
                  iconColor: '#7AC143',
                  timer: 2000,
                  showConfirmButton: false,
                  didClose: () => {
                    this.router.navigate(['/doctor/list']);
                  }
                });
              },
              error: (error) => {
                console.error('Error al actualizar el doctor:', error);
                let errorMessage = 'No se pudieron guardar los cambios. Por favor, intentá nuevamente.';
                
                if (error.status === 404) {
                  errorMessage = 'El doctor no fue encontrado.';
                } else if (error.status === 403) {
                  errorMessage = 'No tenés permisos para realizar esta acción.';
                } else if (error.status === 401) {
                  errorMessage = 'Tu sesión expiró. Por favor, iniciá sesión nuevamente.';
                } else if (error.error) {
                  if (typeof error.error === 'object' && error.error.detail) {
                    errorMessage = error.error.detail;
                  } else if (typeof error.error === 'string') {
                    errorMessage = error.error;
                  }
                } else if (error.message) {
                  errorMessage = error.message;
                }

                Swal.fire({
                  icon: 'error',
                  title: 'Error al guardar cambios',
                  text: errorMessage,
                  background: '#fff',
                  color: '#333',
                  confirmButtonColor: '#F47B20',
                  iconColor: '#000000'
                });
              }
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          // Si cancela, también redirigir al listado
          this.router.navigate(['/doctor/list']);
        }
      });
    } else {
      // Capitalizar nombres propios antes de enviar
      const formValue = { ...this.doctorForm.value };
      const capitalized = capitalizeProperNames(formValue.name, formValue.surname);
      formValue.name = capitalized.name;
      formValue.surname = capitalized.surname;

      const newDoctor = formValue;

      this.http.post(this.apiUrl, newDoctor, { responseType: 'text' })
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '✅ Doctor registrado con éxito',
              text: 'El nuevo doctor fue agregado correctamente.',
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#F47B20',
              iconColor: '#7AC143'
            });
            this.doctorForm.reset();
          },
          error: (error) => {
            console.error('❌ Error al registrar el doctor:', error);
            let errorMessage = 'Ocurrió un problema al registrar el doctor.';
            
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
            } else if (error.statusText) {
              errorMessage = error.statusText;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error al registrar el doctor',
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

