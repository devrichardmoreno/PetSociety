import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { AuthService } from '../../../services/auth/auth.service';
import { AdminService } from '../../../services/admin/admin.service';
import { Admin } from '../../../models/entities/admin';
import { nameValidator, phoneValidator, dniValidator } from '../../../utils/form-validators';
import { capitalizeName } from '../../../utils/text';
import { getFriendlyErrorMessage } from '../../../utils/error-handler';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './admin-profile.html',
  styleUrls: ['./admin-profile.css']
})
export class AdminProfileComponent implements OnInit {
  currentAdmin: Admin | null = null;
  adminForm!: FormGroup;
  isEditMode: boolean = false;
  loading: boolean = true;

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadCurrentAdmin();
  }

  loadCurrentAdmin(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.adminService.getAdminById(userId).subscribe({
        next: (admin: Admin) => {
          this.currentAdmin = admin;
          this.initializeForm(admin);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar datos del administrador:', error);
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudieron cargar los datos del administrador',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#45AEDD',
            iconColor: '#000000'
          });
        }
      });
    } else {
      this.loading = false;
    }
  }

  initializeForm(admin: Admin): void {
    this.adminForm = this.fb.group({
      name: [admin.name, [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      surname: [admin.surname, [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      phone: [admin.phone, [Validators.required, phoneValidator()]],
      dni: [{ value: admin.dni, disabled: true }, [Validators.required, dniValidator()]], // DNI no editable
      email: [admin.email, [Validators.required, Validators.email]]
    });
    // Deshabilitar el formulario por defecto (modo visualización)
    this.adminForm.disable();
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.adminForm.enable();
      this.adminForm.get('dni')?.disable(); // DNI inmodificable
      this.adminForm.get('email')?.disable(); // Email inmodificable
    } else {
      this.adminForm.disable();
      // Restaurar valores originales
      if (this.currentAdmin) {
        this.initializeForm(this.currentAdmin);
      }
    }
  }

  onSubmit(): void {
    if (this.adminForm.invalid) {
      this.adminForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos requeridos correctamente',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    if (!this.currentAdmin?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el ID del administrador',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    // Capitalizar nombres propios antes de enviar
    const formValue = { ...this.adminForm.value };
    formValue.name = capitalizeName(formValue.name);
    formValue.surname = capitalizeName(formValue.surname);
    // DNI y email inmodificables: usar siempre los valores actuales
    formValue.dni = this.currentAdmin.dni;
    formValue.email = this.currentAdmin.email; // Asegurar que el email no se modifique
    // Incluir subscribed si existe
    if (this.currentAdmin.subscribed !== undefined) {
      formValue.subscribed = this.currentAdmin.subscribed;
    }

    this.adminService.updateAdmin(this.currentAdmin.id, formValue).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Datos actualizados',
          text: 'Tus datos han sido actualizados exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        }).then(() => {
          this.loadCurrentAdmin();
          this.isEditMode = false;
        });
      },
      error: (error) => {
        console.error('Error al actualizar datos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron actualizar los datos. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    });
  }

  cancelEdit(): void {
    if (this.currentAdmin) {
      this.initializeForm(this.currentAdmin);
    }
    this.isEditMode = false;
  }

  unsubscribeAdmin(): void {
    if (!this.currentAdmin?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el ID del administrador',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    const adminName = `${this.currentAdmin.name} ${this.currentAdmin.surname}`;

    // Primera confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas darte de baja? Esta acción desactivará tu cuenta de administrador.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#f57c00',
      cancelButtonColor: '#45AEDD',
      iconColor: '#f57c00',
      reverseButtons: false
    }).then((firstResult) => {
      if (firstResult.isConfirmed) {
        // Segunda confirmación con botones invertidos
        Swal.fire({
          title: '¿Realmente estás seguro?',
          text: `Esta acción dará de baja tu cuenta de administrador ${adminName}. ¿Confirmas esta acción?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#f57c00',
          cancelButtonColor: '#45AEDD',
          iconColor: '#f57c00',
          reverseButtons: true
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            this.performUnsubscribe();
          }
        });
      }
    });
  }

  private performUnsubscribe(): void {
    if (!this.currentAdmin?.id) return;

    this.adminService.unsubscribeAdmin(this.currentAdmin.id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Cuenta dada de baja',
          text: 'Tu cuenta ha sido dada de baja exitosamente. Serás redirigido al login.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        }).then(() => {
          this.authService.logout();
          this.router.navigate(['/login']);
        });
      },
      error: (error) => {
        console.error('Error al dar de baja la cuenta:', error);
        const errorMessage = getFriendlyErrorMessage(error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    });
  }
}

