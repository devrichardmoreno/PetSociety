import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PetService } from '../../../../services/pet/pet.service';
import { ClientService } from '../../../../services/client/client.service';
import { PetDTO } from '../../../../models/dto/pet/pet-dto';
import { PetType, PetTypeLabels } from '../../../../models/enums/pet-type.enum';
import { ClientDTO } from '../../../../models/dto/client/client-dto';
import Swal from 'sweetalert2';
import { nameValidator } from '../../../../utils/form-validators';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './pet-form.html',
  styleUrls: ['./pet-form.css']
})
export class PetFormComponent implements OnInit {

  petForm!: FormGroup;
  isEditMode: boolean = false;
  petId?: number;
  selectedClient: ClientDTO | null = null;
  petTypes = Object.values(PetType);
  petTypeLabels = PetTypeLabels;
  clientIdFromQuery: number | null = null; // Para saber si el cliente viene pre-seleccionado
  clientIdFromPetsList: number | null = null; // Para saber si viene desde el listado de mascotas

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private petService: PetService,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.petId = +id;
    }

    // Verificar si hay un clientId en los query parameters (viene desde el listado de clientes)
    const clientIdParam = this.route.snapshot.queryParamMap.get('clientId');
    if (clientIdParam && !this.isEditMode) {
      this.clientIdFromQuery = +clientIdParam;
    }

    // Verificar si viene desde el listado de mascotas (para volver ahí después de editar)
    const fromPetsListParam = this.route.snapshot.queryParamMap.get('fromPetsList');
    if (fromPetsListParam) {
      this.clientIdFromPetsList = +fromPetsListParam;
    }

    // Crear formulario
    // Si viene un clientId desde query params, no es requerido el campo (ya está pre-seleccionado)
    const clientIdValidators = this.clientIdFromQuery ? [] : [Validators.required];
    
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      petType: ['', Validators.required],
      otherType: [''],
      clientId: [this.clientIdFromQuery || '', clientIdValidators]
    });

    // Validación condicional para otherType
    this.petForm.get('petType')?.valueChanges.subscribe(petType => {
      const otherTypeControl = this.petForm.get('otherType');
      if (petType === PetType.OTHER) {
        otherTypeControl?.setValidators([Validators.required, Validators.maxLength(50)]);
      } else {
        otherTypeControl?.clearValidators();
        otherTypeControl?.setValue('');
      }
      otherTypeControl?.updateValueAndValidity();
    });

    // Cargar cliente si viene desde query params o si estamos editando
    if (this.clientIdFromQuery && !this.isEditMode) {
      this.loadClientById(this.clientIdFromQuery);
    } else if (this.isEditMode && this.petId) {
      this.loadPetData(this.petId);
    }
  }

  loadClientById(clientId: number): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client: ClientDTO) => {
        this.selectedClient = client;
        this.petForm.patchValue({ clientId: clientId });
        this.petForm.get('clientId')?.markAsTouched();
      },
      error: (error) => {
        console.error('Error al obtener el cliente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar la información del cliente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20',
          iconColor: '#000000'
        }).then(() => {
          this.router.navigate(['/client/list']);
        });
      }
    });
  }

  loadPetData(id: number): void {
    this.petService.getPetById(id).subscribe({
      next: (pet: PetDTO) => {
        this.petForm.patchValue({
          name: pet.name,
          age: pet.age,
          petType: pet.petType,
          otherType: pet.otherType || '',
          clientId: pet.clientId
        });
        // Cargar el cliente asociado a la mascota
        this.loadClientById(pet.clientId);
      },
      error: (error) => {
        console.error('Error al cargar datos de la mascota:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos de la mascota.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20',
          iconColor: '#000000'
        });
        this.router.navigate(['/admin/home']);
      }
    });
  }

  getPetTypeLabel(petType: PetType): string {
    return PetTypeLabels[petType] || petType;
  }

  goBack(): void {
    window.history.back();
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: this.isEditMode 
          ? 'Por favor completá todos los campos requeridos correctamente para modificar la mascota'
          : 'Por favor completá todos los campos requeridos correctamente',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#F47B20',
        iconColor: '#000000'
      });
      this.petForm.markAllAsTouched();
      return;
    }

    const formValue = { ...this.petForm.value };
    
    // Capitalizar nombre de la mascota
    if (formValue.name) {
      formValue.name = formValue.name.charAt(0).toUpperCase() + formValue.name.slice(1).toLowerCase();
    }

    // Capitalizar otherType si existe
    if (formValue.otherType) {
      formValue.otherType = formValue.otherType.charAt(0).toUpperCase() + formValue.otherType.slice(1).toLowerCase();
    }

    // Asegurarse de usar el clientId correcto (prioridad: query param > form value)
    const finalClientId = this.clientIdFromQuery || formValue.clientId;

    const petDTO: PetDTO = {
      name: formValue.name,
      age: formValue.age,
      petType: formValue.petType,
      otherType: formValue.petType === PetType.OTHER ? formValue.otherType : undefined,
      clientId: finalClientId,
      active: true
    };

    if (this.isEditMode && this.petId) {
      // Modo edición: actualizar mascota
      this.petService.updatePet(this.petId, petDTO).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '✅ Mascota modificada con éxito',
            text: 'Los datos de la mascota fueron modificados correctamente.',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20',
            iconColor: '#7AC143'
          }).then(() => {
            // Si viene desde el listado de mascotas, volver ahí; si no, al home del admin
            if (this.clientIdFromPetsList) {
              this.router.navigate(['/client', this.clientIdFromPetsList, 'pets']);
            } else {
              this.router.navigate(['/admin/home']);
            }
          });
        },
        error: (error) => {
          console.error('❌ Error al modificar la mascota:', error);
          let errorMessage = 'Ocurrió un problema al modificar la mascota.';
          
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
            title: 'Error al modificar la mascota',
            text: errorMessage,
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20',
            iconColor: '#000000'
          });
        }
      });
    } else {
      // Modo creación: crear nueva mascota
      this.petService.createPet(petDTO).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '✅ Mascota registrada con éxito',
            text: 'La nueva mascota fue agregada correctamente.',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20',
            iconColor: '#7AC143'
          }).then(() => {
            // Si viene desde el listado de clientes, volver al listado
            if (this.clientIdFromQuery) {
              this.router.navigate(['/client/list']);
            } else {
              this.router.navigate(['/admin/home']);
            }
          });
        },
        error: (error) => {
          console.error('❌ Error al registrar la mascota:', error);
          let errorMessage = 'Ocurrió un problema al registrar la mascota.';
          
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
            title: 'Error al registrar la mascota',
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

