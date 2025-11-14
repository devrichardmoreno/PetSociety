import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { PetService } from '../../services/pet.service';
import { ClientService } from '../../services/client.service';
import { PetDTO } from '../../models/dto/PetDTO';
import { PetType, PetTypeLabels } from '../../models/dto/pet-type.enum';
import { ClientDTO } from '../../models/dto/ClientDTO';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { nameValidator } from '../../utils/form-validators';

@Component({
  selector: 'app-pet-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './pet-form.html',
  styleUrls: ['./pet-form.css']
})
export class PetFormComponent implements OnInit {

  petForm!: FormGroup;
  isEditMode: boolean = false;
  petId?: number;
  clients: ClientDTO[] = [];
  filteredClients: ClientDTO[] = [];
  selectedClient: ClientDTO | null = null;
  showClientDropdown: boolean = false;
  clientSearchTerm: string = '';
  petTypes = Object.values(PetType);
  petTypeLabels = PetTypeLabels;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private petService: PetService,
    private clientService: ClientService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Verificar si estamos en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.petId = +id;
    }

    // Crear formulario
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()]],
      age: ['', [Validators.required, Validators.min(1), Validators.max(30)]],
      petType: ['', Validators.required],
      otherType: [''],
      clientId: ['', Validators.required]
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

    // Cargar clientes activos primero
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getAllActiveClientsWithPetsCount().subscribe({
      next: (data: any[]) => {
        this.clients = data.map((client: any) => ({
          id: client.id,
          name: client.name,
          surname: client.surname,
          dni: client.dni,
          phone: client.phone,
          email: client.email,
          petsCount: client.petsCount || 0
        }));
        this.filteredClients = this.clients;
        
        // Cargar datos de la mascota si estamos en modo edición
        // Ahora que los clientes están cargados, podemos cargar el pet
        if (this.isEditMode && this.petId) {
          this.loadPetData(this.petId);
        }
      },
      error: (error) => {
        console.error('Error al obtener clientes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los clientes.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20',
          iconColor: '#000000'
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
        // Buscar y seleccionar el cliente
        const client = this.clients.find(c => c.id === pet.clientId);
        if (client) {
          this.selectedClient = client;
          this.clientSearchTerm = `${client.name} ${client.surname}`;
        }
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

  onClientSearchTermChange(value: string): void {
    // Si hay un cliente seleccionado y el usuario está escribiendo algo diferente, limpiar la selección
    if (this.selectedClient) {
      const expectedName = `${this.selectedClient.name} ${this.selectedClient.surname}`;
      if (value !== expectedName) {
        // El usuario está modificando el texto, limpiar la selección
        this.selectedClient = null;
        this.petForm.patchValue({ clientId: '' });
      } else {
        // El valor coincide exactamente con el cliente seleccionado, mantenerlo y no filtrar
        this.clientSearchTerm = value;
        this.filteredClients = this.clients;
        return;
      }
    }

    // Actualizar el término de búsqueda
    this.clientSearchTerm = value;

    // Si el campo está vacío, mostrar todos los clientes
    if (!value || value.trim() === '') {
      this.filteredClients = this.clients;
      return;
    }

    // Filtrar clientes según el término de búsqueda
    const search = value.toLowerCase().trim();
    const searchWords = search.split(/\s+/);

    this.filteredClients = this.clients.filter(client => {
      const fullName = `${client.name} ${client.surname}`.toLowerCase();
      const reverseFullName = `${client.surname} ${client.name}`.toLowerCase();
      const name = client.name?.toLowerCase() || '';
      const surname = client.surname?.toLowerCase() || '';

      if (searchWords.length === 1) {
        return name.includes(search) || surname.includes(search);
      }

      const searchPhrase = searchWords.join(' ');
      return fullName.includes(searchPhrase) || reverseFullName.includes(searchPhrase);
    });
  }

  selectClient(client: ClientDTO): void {
    // Establecer el cliente seleccionado primero
    this.selectedClient = client;
    // Actualizar el formulario con el ID del cliente
    this.petForm.patchValue({ clientId: client.id });
    // Establecer el nombre completo en el campo de búsqueda ANTES de cerrar el dropdown
    const fullName = `${client.name} ${client.surname}`;
    this.clientSearchTerm = fullName;
    // Cerrar el dropdown
    this.showClientDropdown = false;
    // Resetear la lista filtrada
    this.filteredClients = this.clients;
    // Marcar el campo como touched para que muestre validación si es necesario
    this.petForm.get('clientId')?.markAsTouched();
    // Forzar la detección de cambios para asegurar que el input se actualice
    this.cdr.detectChanges();
  }

  toggleClientDropdown(): void {
    this.showClientDropdown = !this.showClientDropdown;
    if (this.showClientDropdown) {
      // Si hay un cliente seleccionado, mantener su nombre; si no, limpiar para buscar
      if (this.selectedClient) {
        this.clientSearchTerm = `${this.selectedClient.name} ${this.selectedClient.surname}`;
      } else {
        this.clientSearchTerm = '';
      }
      this.filteredClients = this.clients;
    }
  }

  onClientInputFocus(): void {
    this.showClientDropdown = true;
    // Si hay un cliente seleccionado, mantener su nombre visible
    // Si no hay cliente seleccionado, limpiar para buscar
    if (!this.selectedClient) {
      this.clientSearchTerm = '';
      this.filteredClients = this.clients;
    } else {
      // Mantener el nombre del cliente seleccionado visible
      this.clientSearchTerm = `${this.selectedClient.name} ${this.selectedClient.surname}`;
      this.filteredClients = this.clients;
    }
  }

  onClientInputBlur(): void {
    // Usar setTimeout para permitir que el click en el dropdown se procese primero
    setTimeout(() => {
      // Solo cerrar el dropdown si no se está seleccionando un cliente
      if (!this.showClientDropdown) {
        return;
      }
      
      // Si hay un cliente seleccionado, asegurarse de que el nombre completo esté visible
      if (this.selectedClient) {
        const expectedName = `${this.selectedClient.name} ${this.selectedClient.surname}`;
        // Asegurarse de que el nombre completo esté visible
        this.clientSearchTerm = expectedName;
        this.cdr.detectChanges();
      }
      
      this.showClientDropdown = false;
    }, 300);
  }

  getPetTypeLabel(petType: PetType): string {
    return PetTypeLabels[petType] || petType;
  }

  onSubmit(): void {
    if (this.petForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos requeridos correctamente',
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

    const petDTO: PetDTO = {
      name: formValue.name,
      age: formValue.age,
      petType: formValue.petType,
      otherType: formValue.petType === PetType.OTHER ? formValue.otherType : undefined,
      clientId: formValue.clientId,
      active: true
    };

    if (this.isEditMode && this.petId) {
      // Modo edición: actualizar mascota
      this.petService.updatePet(this.petId, petDTO).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '✅ Mascota actualizada con éxito',
            text: 'Los datos de la mascota fueron actualizados correctamente.',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20',
            iconColor: '#7AC143'
          }).then(() => {
            this.router.navigate(['/admin/home']);
          });
        },
        error: (error) => {
          console.error('❌ Error al actualizar la mascota:', error);
          let errorMessage = 'Ocurrió un problema al actualizar la mascota.';
          
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
            title: 'Error al actualizar la mascota',
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
          });
          this.petForm.reset();
          this.selectedClient = null;
          this.clientSearchTerm = '';
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

