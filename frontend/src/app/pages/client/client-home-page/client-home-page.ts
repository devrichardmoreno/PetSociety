import { Component, OnInit } from '@angular/core';
import { HeaderClient } from '../../../components/header-client/header-client';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../../services/client.service';
import { AuthService } from '../../../services/auth.service';
import { PetService } from '../../../services/pet.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Pet } from '../../../models/Pet';
import { UserData } from '../../../models/UserData';
import { ClientProfileSection } from '../components/client-profile-section/client-profile-section';
import { ClientProfileEdit } from '../components/client-profile-edit/client-profile-edit';
import { ClientPetsList } from '../components/client-pets-list/client-pets-list';
import { ClientPetAddForm } from '../components/client-pet-add-form/client-pet-add-form';
import { ClientPetEditForm } from '../components/client-pet-edit-form/client-pet-edit-form';

@Component({
  selector: 'app-client-home-page',
  imports: [
    HeaderClient, 
    CommonModule, 
    ReactiveFormsModule,
    ClientProfileSection,
    ClientProfileEdit,
    ClientPetsList,
    ClientPetAddForm,
    ClientPetEditForm
  ],
  templateUrl: './client-home-page.html',
  styleUrl: './client-home-page.css'
})
export class ClientHomePage implements OnInit {
  activeTab: 'mascotas' | 'datos-personales' = 'mascotas';

  // Datos del usuario
  userData: UserData = {
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: ''
  };

  // Estado para controlar si está en modo edición
  isEditing = false;
  editForm!: FormGroup;

  // Estado para controlar si está agregando mascota
  isAddingPet = false;
  addPetForm!: FormGroup;

  // Estado para controlar si está editando mascota
  isEditingPet = false;
  editPetForm!: FormGroup;
  editingPetId: number | null = null;

  // Lista de mascotas del cliente
  pets: Pet[] = [];

  constructor(
    private clientService: ClientService,
    private authService: AuthService,
    private petService: PetService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClientData();
    this.initializeForms();
    this.loadPetsData();
  }

  initializeForms(): void {
    // Formulario de edición de datos personales
    this.editForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{7,8}$')]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]]
    });

    // Formulario de nueva mascota
    this.addPetForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(30)]]
    });

    // Formulario de edición de mascota
    this.editPetForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(30)]]
    });
  }

  loadClientData(): void {
    const userId = this.authService.getUserId();
    
    if (userId) {
      this.clientService.getClientById(userId).subscribe({
        next: (client) => {
          this.userData = {
            nombre: client.name,
            apellido: client.surname,
            dni: client.dni,
            telefono: client.phone,
            email: client.email
          };
        },
        error: (error) => {
          console.error('Error al cargar datos del cliente:', error);
        }
      });
    }
  }

  loadPetsData(): void {
    const userId = this.authService.getUserId();
    
    if (userId) {
      this.petService.getAllPetsByClientId(userId).subscribe({
        next: (petsDTO) => {
          // Mapear PetDTO[] a Pet[]
          this.pets = petsDTO.map(petDTO => ({
            id: petDTO.id!,
            nombre: petDTO.name,
            edad: petDTO.age
          }));
        },
        error: (error) => {
          // Si el cliente no tiene mascotas, el backend lanza NoPetsException
          // En ese caso, simplemente dejamos el array vacío
          this.pets = [];
          console.log('No se encontraron mascotas para el cliente:', error);
        }
      });
    }
  }

  get userName(): string {
    return `${this.userData.nombre} ${this.userData.apellido}`;
  }

  switchTab(tab: 'mascotas' | 'datos-personales'): void {
    this.activeTab = tab;
  }

  // ========== MÉTODOS PARA MASCOTAS ==========
  showAddPetForm(): void {
    this.isAddingPet = true;
  }

  cancelAddPet(): void {
    this.isAddingPet = false;
    this.addPetForm.reset();
  }

  savePet(): void {
    if (this.addPetForm.invalid) {
      Object.keys(this.addPetForm.controls).forEach(key => {
        this.addPetForm.get(key)?.markAsTouched();
      });
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar al usuario',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD'
      });
      return;
    }

    const formData = this.addPetForm.value;
    const petDTO = {
      name: formData.nombre,
      age: parseInt(formData.edad),
      active: true,
      clientId: userId
    };

    this.petService.createPet(petDTO).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Mascota agregada!',
          text: 'Tu mascota ha sido registrada correctamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#7AC143'
        }).then(() => {
          this.isAddingPet = false;
          this.addPetForm.reset();
          // Recargar la lista de mascotas
          this.loadPetsData();
        });
      },
      error: (error) => {
        console.error('Error al agregar mascota:', error);
        
        // Verificar si es un error de límite de mascotas (409 Conflict)
        let errorMessage = 'No se pudo registrar tu mascota. Por favor, intenta nuevamente.';
        if (error.status === 409) {
          errorMessage = 'Un cliente puede tener un máximo de 5 mascotas registradas';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error al agregar mascota',
          text: errorMessage,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  onEditPet(petId: number): void {
    const pet = this.pets.find(p => p.id === petId);
    if (!pet) {
      console.error('Mascota no encontrada:', petId);
      return;
    }
    
    // Pre-cargar el formulario con los datos actuales de la mascota
    this.editPetForm.patchValue({
      nombre: pet.nombre,
      edad: pet.edad
    });
    
    this.editingPetId = petId;
    this.isEditingPet = true;
  }

  cancelEditPet(): void {
    this.isEditingPet = false;
    this.editingPetId = null;
    this.editPetForm.reset();
  }

  savePetEdit(): void {
    if (this.editPetForm.invalid) {
      Object.keys(this.editPetForm.controls).forEach(key => {
        this.editPetForm.get(key)?.markAsTouched();
      });
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    if (!this.editingPetId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar la mascota a editar',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD'
      });
      return;
    }

    // Buscar la mascota para obtener el clientId
    const pet = this.pets.find(p => p.id === this.editingPetId);
    if (!pet) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se encontró la mascota',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD'
      });
      return;
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar al usuario',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD'
      });
      return;
    }

    const formData = this.editPetForm.value;
    const petDTO = {
      name: formData.nombre,
      age: parseInt(formData.edad),
      active: true,
      clientId: userId
    };

    this.petService.updatePet(this.editingPetId, petDTO).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Mascota actualizada!',
          text: 'Los datos de tu mascota se han actualizado correctamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#7AC143'
        }).then(() => {
          this.isEditingPet = false;
          this.editingPetId = null;
          this.editPetForm.reset();
          // Recargar la lista de mascotas
          this.loadPetsData();
        });
      },
      error: (error) => {
        console.error('Error al actualizar mascota:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: 'No se pudieron actualizar los datos de la mascota. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  onDeletePet(petId: number): void {
    // Buscar el nombre de la mascota para mostrarlo en la confirmación
    const pet = this.pets.find(p => p.id === petId);
    const petName = pet ? pet.nombre : 'la mascota';

    // Primera confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas dar de baja a ${petName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'No, cancelar',
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#45AEDD',
      iconColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        // Segunda confirmación con botones invertidos
        Swal.fire({
          title: '¿REALMENTE estás seguro?',
          html: `<p style="font-size: 1.1rem;">Esta acción <strong>NO se puede deshacer</strong>.<br>Si estás seguro, presiona el botón <strong>rojo</strong> para dar de baja a <strong>${petName}</strong>.</p>`,
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Sí, dar de baja',
          cancelButtonText: 'No, mantener la mascota',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#45AEDD',
          iconColor: '#dc3545',
          reverseButtons: true
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            this.executeDeletePet(petId, petName);
          }
        });
      }
    });
  }

  executeDeletePet(petId: number, petName: string): void {
    this.petService.deletePet(petId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Mascota dada de baja!',
          html: `La mascota <strong>${petName}</strong> fue exitosamente dada de baja.`,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#7AC143'
        }).then(() => {
          // Recargar la lista de mascotas para que la eliminada no aparezca
          this.loadPetsData();
        });
      },
      error: (error) => {
        console.error('Error al dar de baja la mascota:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al dar de baja',
          text: 'No se pudo procesar tu solicitud. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  onScheduleAppointment(petId: number): void {
    console.log('Agendar cita para mascota:', petId);
    // TODO: Implementar cuando tengamos la funcionalidad
  }

  onCancelAppointment(petId: number): void {
    console.log('Cancelar cita para mascota:', petId);
    // TODO: Implementar cuando tengamos la funcionalidad
  }

  // ========== MÉTODOS PARA DATOS PERSONALES ==========
  onEditUserData(): void {
    this.editForm.patchValue({
      nombre: this.userData.nombre,
      apellido: this.userData.apellido,
      dni: this.userData.dni,
      telefono: this.userData.telefono,
      email: this.userData.email
    });
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveUserData(): void {
    if (this.editForm.invalid) {
      Object.keys(this.editForm.controls).forEach(key => {
        this.editForm.get(key)?.markAsTouched();
      });
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor completa todos los campos correctamente',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas guardar los cambios realizados?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#45AEDD',
      cancelButtonColor: '#d33',
      iconColor: '#45AEDD'
    }).then((result) => {
      if (result.isConfirmed) {
        const userId = this.authService.getUserId();
        if (!userId) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo identificar al usuario',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#45AEDD'
          });
          return;
        }

        const formData = this.editForm.value;
        const clientDTO = {
          name: formData.nombre,
          surname: formData.apellido,
          dni: formData.dni,
          phone: formData.telefono,
          email: formData.email
        };

        this.clientService.updateClient(userId, clientDTO).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Datos actualizados!',
              text: 'Tus datos personales se han actualizado correctamente',
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#45AEDD',
              iconColor: '#7AC143'
            }).then(() => {
              this.isEditing = false;
              this.loadClientData();
            });
          },
          error: (error) => {
            console.error('Error al actualizar datos:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error al actualizar',
              text: 'No se pudieron actualizar tus datos. Por favor, intenta nuevamente.',
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#45AEDD'
            });
          }
        });
      }
    });
  }

  onDeleteUser(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas darte de baja de Pet Society?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, darme de baja',
      cancelButtonText: 'No, cancelar',
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#45AEDD',
      iconColor: '#dc3545'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '¿REALMENTE estás seguro?',
          html: '<p style="font-size: 1.1rem;">Esta acción <strong>NO se puede deshacer</strong>.<br>Si estás seguro, presiona el botón <strong>rojo</strong> para darte de baja.</p>',
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Sí, darme de baja',
          cancelButtonText: 'No, mantener mi cuenta',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#45AEDD',
          iconColor: '#dc3545',
          reverseButtons: true
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            this.executeUnsubscribe();
          }
        });
      }
    });
  }

  executeUnsubscribe(): void {
    const userId = this.authService.getUserId();
    
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo identificar al usuario',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD'
      });
      return;
    }

    this.clientService.unsubscribeClient(userId).subscribe({
      next: () => {
        this.authService.logout();
        
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta dada de baja!',
          html: `El usuario <strong>${this.userName}</strong> fue exitosamente dado de baja.`,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#7AC143',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          this.router.navigate(['/']);
        });
      },
      error: (error) => {
        console.error('Error al darse de baja:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al darse de baja',
          text: 'No se pudo procesar tu solicitud. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }
}
