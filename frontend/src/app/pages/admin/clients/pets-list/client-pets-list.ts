import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from '../../../../services/pet/pet.service';
import { ClientService } from '../../../../services/client/client.service';
import { AppointmentService } from '../../../../services/appointment/appointment.service';
import { PetDTO } from '../../../../models/dto/pet/pet-dto';
import { ClientDTO } from '../../../../models/dto/client/client-dto';
import { AppointmentResponseDTO } from '../../../../models/dto/appointment/appointment-response-dto';
import { PetType, PetTypeLabels } from '../../../../models/enums/pet-type.enum';
import { PetEmojiUtil } from '../../../../utils/pet-emoji.util';
import { ScheduleAppointmentComponent } from '../../../client/schedule-appointment/schedule-appointment';
import { Reason } from '../../../../models/enums/reason.enum';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { DiagnosesHistoryModal } from '../../../shared/diagnoses/diagnoses-history-modal/diagnoses-history-modal';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-pets-list',
  standalone: true,
  imports: [CommonModule, ScheduleAppointmentComponent, MatDialogModule],
  templateUrl: './client-pets-list.html',
  styleUrls: ['./client-pets-list.css']
})
export class ClientPetsListComponent implements OnInit {

  pets: PetDTO[] = [];
  client: ClientDTO | null = null;
  loading: boolean = true;
  errorMessage: string = '';
  clientId!: number;
  isSchedulingAppointment: boolean = false;
  schedulingPetId: number | null = null;
  scheduledAppointments: Map<number, AppointmentResponseDTO> = new Map();

  constructor(
    private petService: PetService,
    private clientService: ClientService,
    private appointmentService: AppointmentService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Obtener el clientId de los parámetros de la ruta
    this.route.params.subscribe(params => {
      this.clientId = +params['clientId'];
      if (this.clientId) {
        this.loadClientData();
        this.loadPets();
      } else {
        this.errorMessage = 'ID de cliente no válido';
        this.loading = false;
      }
    });
  }

  loadClientData(): void {
    this.clientService.getClientById(this.clientId).subscribe({
      next: (client: ClientDTO) => {
        this.client = client;
      },
      error: (error) => {
        console.error('Error al cargar datos del cliente:', error);
      }
    });
  }

  loadPets(): void {
    this.petService.getAllPetsByClientId(this.clientId).subscribe({
      next: (pets: PetDTO[]) => {
        // Filtrar solo las mascotas activas (active = true o undefined)
        this.pets = pets.filter(pet => pet.active !== false);
        // Cargar las citas programadas para cada mascota
        this.loadScheduledAppointments();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener las mascotas del cliente:', error);
        this.errorMessage = 'No se pudieron cargar las mascotas del cliente';
        this.loading = false;
      }
    });
  }

  loadScheduledAppointments(): void {
    this.scheduledAppointments.clear();
    this.pets.forEach(pet => {
      if (pet.id) {
        this.appointmentService.getScheduledAppointmentIdByPetId(pet.id).subscribe({
          next: (appointmentId) => {
            if (appointmentId) {
              // Obtener los detalles completos de la cita
              this.appointmentService.getAppointmentById(appointmentId).subscribe({
                next: (appointment: AppointmentResponseDTO) => {
                  this.scheduledAppointments.set(pet.id!, appointment);
                },
                error: (error) => {
                  console.error(`Error al obtener detalles de la cita para mascota ${pet.id}:`, error);
                }
              });
            }
          },
          error: (error) => {
            // Si no hay cita programada, simplemente no hacer nada (404 es esperado)
            if (error.status !== 404) {
              console.error(`Error al verificar cita programada para mascota ${pet.id}:`, error);
            }
          }
        });
      }
    });
  }

  hasScheduledAppointment(petId: number): boolean {
    return this.scheduledAppointments.has(petId);
  }

  getScheduledAppointment(petId: number): AppointmentResponseDTO | undefined {
    return this.scheduledAppointments.get(petId);
  }

  viewAppointmentDetails(petId: number): void {
    const appointment = this.getScheduledAppointment(petId);
    if (!appointment) return;

    const startDate = new Date(appointment.startTime);
    const endDate = new Date(appointment.endTime);
    
    const formattedDate = startDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedStartTime = startDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const formattedEndTime = endDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const reasonLabel = this.getReasonLabel(appointment.reason);
    const statusLabel = this.getStatusLabel(appointment.status);
    const paymentStatus = appointment.aproved ? 'Pagada' : 'No pagada';
    const paymentStatusColor = appointment.aproved ? '#66bb6a' : '#f57c00';
    const pet = this.pets.find(p => p.id === petId);
    const petName = pet ? pet.name : 'la mascota';
    const appointmentInfo = `${formattedDate} ${formattedStartTime}`;

    Swal.fire({
      title: 'Detalles de la Cita',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <div style="margin-bottom: 1rem;">
            <strong style="color: #45AEDD; font-size: 1.1em;">📅 Fecha:</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 1em;">${formattedDate}</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <strong style="color: #45AEDD; font-size: 1.1em;">🕐 Horario:</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 1em;">${formattedStartTime} - ${formattedEndTime}</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <strong style="color: #45AEDD; font-size: 1.1em;">👨‍⚕️ Doctor:</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 1em;">${appointment.doctorName}</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <strong style="color: #45AEDD; font-size: 1.1em;">📋 Motivo:</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 1em;">${reasonLabel}</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <strong style="color: #45AEDD; font-size: 1.1em;">🏥 Estado:</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 1em;">${statusLabel}</p>
          </div>
          <div style="margin-bottom: 1rem;">
            <strong style="color: #45AEDD; font-size: 1.1em;">💳 Pago:</strong>
            <p style="margin: 0.5rem 0 0 0; font-size: 1em; color: ${paymentStatusColor}; font-weight: 600;">${paymentStatus}</p>
          </div>
        </div>
      `,
      width: '600px',
      background: '#fff',
      color: '#333',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonColor: '#45AEDD',
      cancelButtonColor: '#dc3545',
      denyButtonColor: appointment.aproved ? '#f57c00' : '#66bb6a',
      confirmButtonText: 'Cerrar',
      cancelButtonText: 'Cancelar cita',
      denyButtonText: appointment.aproved ? 'Marcar como no pagada' : 'Marcar como pagada',
      icon: 'info',
      iconColor: '#45AEDD'
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.cancel) {
        // El usuario hizo clic en "Cancelar cita"
        this.cancelAppointment(petId, petName, appointmentInfo);
      } else if (result.isDenied) {
        // El usuario hizo clic en el botón de cambiar estado de pago
        this.togglePaymentStatus(appointment.id!, petId);
      }
    });
  }

  togglePaymentStatus(appointmentId: number, petId: number): void {
    const appointment = this.getScheduledAppointment(petId);
    if (!appointment) return;

    const isCurrentlyPaid = appointment.aproved;
    const action = isCurrentlyPaid ? 'marcar como no pagada' : 'marcar como pagada';
    
    Swal.fire({
      title: '¿Confirmar cambio?',
      text: `¿Deseas ${action} esta cita?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      background: '#fff',
      color: '#333',
      confirmButtonColor: isCurrentlyPaid ? '#f57c00' : '#66bb6a',
      cancelButtonColor: '#45AEDD'
    }).then((result) => {
      if (result.isConfirmed) {
        if (isCurrentlyPaid) {
          // Marcar como no pagada
          this.appointmentService.disapproveAppointment(appointmentId).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: 'La cita ha sido marcada como no pagada',
                background: '#fff',
                color: '#333',
                confirmButtonColor: '#45AEDD',
                iconColor: '#000000'
              }).then(() => {
                // Recargar las citas programadas para actualizar el estado
                this.loadScheduledAppointments();
                // Volver a mostrar los detalles actualizados
                this.viewAppointmentDetails(petId);
              });
            },
            error: (error) => {
              console.error('Error al cambiar estado de pago:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cambiar el estado de pago. Por favor, intenta nuevamente.',
                background: '#fff',
                color: '#333',
                confirmButtonColor: '#45AEDD',
                iconColor: '#000000'
              });
            }
          });
        } else {
          // Marcar como pagada
          this.appointmentService.approveAppointment(appointmentId).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Estado actualizado',
                text: 'La cita ha sido marcada como pagada',
                background: '#fff',
                color: '#333',
                confirmButtonColor: '#45AEDD',
                iconColor: '#000000'
              }).then(() => {
                // Recargar las citas programadas para actualizar el estado
                this.loadScheduledAppointments();
                // Volver a mostrar los detalles actualizados
                this.viewAppointmentDetails(petId);
              });
            },
            error: (error) => {
              console.error('Error al cambiar estado de pago:', error);
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cambiar el estado de pago. Por favor, intenta nuevamente.',
                background: '#fff',
                color: '#333',
                confirmButtonColor: '#45AEDD',
                iconColor: '#000000'
              });
            }
          });
        }
      }
    });
  }

  cancelAppointment(petId: number, petName: string, appointmentInfo: string): void {
    // Primera confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas cancelar la cita de ${petName} programada para el ${appointmentInfo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar cita',
      cancelButtonText: 'No, mantener la cita',
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
          html: `<p style="font-size: 1.1rem;">Esta acción <strong>NO se puede deshacer</strong>.<br>Si estás seguro, presiona el botón <strong>rojo</strong> para cancelar la cita de <strong>${petName}</strong>.</p>`,
          icon: 'error',
          showCancelButton: true,
          confirmButtonText: 'Sí, cancelar cita',
          cancelButtonText: 'No, mantener la cita',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#dc3545',
          cancelButtonColor: '#45AEDD',
          iconColor: '#dc3545',
          reverseButtons: true
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            this.executeCancelAppointment(petId, petName);
          }
        });
      }
    });
  }

  executeCancelAppointment(petId: number, petName: string): void {
    // Primero obtener el ID de la cita programada
    this.appointmentService.getScheduledAppointmentIdByPetId(petId).subscribe({
      next: (appointmentId) => {
        // Cancelar la cita
        this.appointmentService.cancelAppointment(appointmentId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Cita cancelada!',
              html: `La cita de <strong>${petName}</strong> fue exitosamente cancelada.`,
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#45AEDD',
              iconColor: '#7AC143'
            }).then(() => {
              // Recargar los datos para actualizar la vista
              this.loadPets();
            });
          },
          error: (error) => {
            console.error('Error al cancelar cita:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error al cancelar',
              text: 'No se pudo cancelar la cita. Por favor, intenta nuevamente.',
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#45AEDD'
            });
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener ID de la cita:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo encontrar la cita programada.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD'
        });
      }
    });
  }

  getReasonLabel(reason: Reason): string {
    const labels: { [key in Reason]: string } = {
      [Reason.CONTROL]: 'Control',
      [Reason.EMERGENCY]: 'Emergencia',
      [Reason.VACCINATION]: 'Vacunación',
      [Reason.NUTRITION]: 'Nutrición'
    };
    return labels[reason] || reason;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'TO_BEGIN': 'Programada',
      'SUCCESSFULLY': 'Completada',
      'CANCELED': 'Cancelada',
      'AVAILABLE': 'Disponible'
    };
    return labels[status] || status;
  }

  showInactivePets(): void {
    // Obtener todas las mascotas (activas e inactivas) y filtrar las inactivas
    this.petService.getAllPetsByClientIdIncludingInactive(this.clientId).subscribe({
      next: (allPets: PetDTO[]) => {
        // Filtrar las inactivas (active === false)
        const inactivePets = allPets.filter(pet => pet.active === false);
        
        if (inactivePets.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin mascotas dadas de baja',
            text: 'Este cliente no tiene mascotas dadas de baja',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#45AEDD',
            iconColor: '#000000'
          });
          return;
        }

        // Crear el HTML para mostrar las mascotas dadas de baja con botones de reactivar
        const inactivePetsHtml = inactivePets.map((pet, index) => {
          const petTypeLabel = this.getPetTypeLabel(pet.petType, pet.otherType);
          const emoji = this.getPetTypeEmoji(pet.petType);
          return `
            <div style="text-align: left; margin-bottom: 20px; padding: 15px; background-color: #fff3e0; border-left: 4px solid #f57c00; border-radius: 8px;">
              <strong style="font-size: 1.1em; color: #e65100;">${emoji} ${pet.name}</strong><br>
              <span style="color: #666; display: block; margin-top: 5px;">Tipo: ${petTypeLabel}</span>
              <span style="color: #666; display: block;">Edad: ${pet.age} años</span>
              <button 
                class="reactivate-pet-btn" 
                data-pet-id="${pet.id}" 
                style="margin-top: 10px; padding: 8px 16px; background: linear-gradient(135deg, #66bb6a 0%, #4caf50 100%); color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3); transition: all 0.3s ease;"
                onmouseover="this.style.background='linear-gradient(135deg, #4caf50 0%, #43a047 100%)'; this.style.transform='translateY(-2px)';"
                onmouseout="this.style.background='linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)'; this.style.transform='translateY(0)';"
              >
                Reactivar
              </button>
            </div>
          `;
        }).join('');

        Swal.fire({
          title: `Mascotas dadas de baja de ${this.client?.name} ${this.client?.surname}`,
          html: `<div style="max-height: 500px; overflow-y: auto; padding: 10px;">${inactivePetsHtml}</div>`,
          width: '700px',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          confirmButtonText: 'Cerrar',
          didOpen: () => {
            // Agregar event listeners a los botones después de que se abra el modal
            const reactivateButtons = document.querySelectorAll('.reactivate-pet-btn');
            reactivateButtons.forEach(button => {
              button.addEventListener('click', (e) => {
                e.stopPropagation();
                const petId = parseInt((button as HTMLElement).getAttribute('data-pet-id') || '0');
                if (petId) {
                  Swal.close();
                  this.reactivatePet(petId);
                }
              });
            });
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener las mascotas dadas de baja:', error);
        let errorMessage = 'No se pudieron cargar las mascotas dadas de baja';
        
        // Si es un error 404 o lista vacía, mostrar mensaje más específico
        if (error.status === 404 || error.status === 204) {
          Swal.fire({
            icon: 'info',
            title: 'Sin mascotas dadas de baja',
            text: 'Este cliente no tiene mascotas dadas de baja',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#45AEDD',
            iconColor: '#000000'
          });
          return;
        }
        
        // Mostrar detalles del error en consola para debugging
        if (error.error) {
          console.error('Detalles del error:', error.error);
        }
        
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

  getPetTypeLabel(petType: string, otherType?: string): string {
    const label = PetTypeLabels[petType as keyof typeof PetTypeLabels] || petType;
    return otherType ? `${label} (${otherType})` : label;
  }

  getPetTypeEmoji(petType: PetType | string): string {
    return PetEmojiUtil.getEmoji(petType);
  }

  // Métodos placeholder para los botones (sin funcionalidad por ahora)
  editAppointment(petId: number): void {
    // Navegar al formulario de edición de mascota con query param para volver al listado
    this.router.navigate(['/pet/create/admin', petId], {
      queryParams: { fromPetsList: this.clientId }
    });
  }

  deletePet(petId: number): void {
    // Buscar la mascota para obtener su nombre
    const pet = this.pets.find(p => p.id === petId);
    const petName = pet ? pet.name : 'la mascota';

    // Primera confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas dar de baja a ${petName}?`,
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
          text: `Esta acción dará de baja a ${petName}. ¿Confirmas esta acción?`,
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
            // El usuario presionó "Sí" en la segunda pregunta
            this.performDeletePet(petId);
          }
        });
      }
    });
  }

  private performDeletePet(petId: number): void {
    this.petService.deletePet(petId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Mascota dada de baja',
          text: 'La mascota ha sido dada de baja exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
        // Recargar la lista de mascotas
        this.loadPets();
      },
      error: (error) => {
        console.error('Error al dar de baja la mascota:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo dar de baja la mascota. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    });
  }

  scheduleAppointment(petId: number): void {
    this.schedulingPetId = petId;
    this.isSchedulingAppointment = true;
  }

  onAppointmentScheduled(): void {
    this.isSchedulingAppointment = false;
    this.schedulingPetId = null;
    // Recargar la lista de mascotas para actualizar la vista (esto también recargará las citas programadas)
    this.loadPets();
  }

  onCancelSchedule(): void {
    this.isSchedulingAppointment = false;
    this.schedulingPetId = null;
  }

  reactivatePet(petId: number): void {
    // Primero validar que el cliente no tenga 5 mascotas activas
    this.petService.getAllPetsByClientId(this.clientId).subscribe({
      next: (activePets: PetDTO[]) => {
        if (activePets.length >= 5) {
          Swal.fire({
            icon: 'warning',
            title: 'Límite alcanzado',
            text: 'Un cliente puede tener un máximo de 5 mascotas activas. No se puede reactivar esta mascota.',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#45AEDD',
            iconColor: '#f57c00'
          }).then(() => {
            // Volver a mostrar el listado de mascotas dadas de baja
            this.showInactivePets();
          });
          return;
        }

        // Buscar la mascota para obtener su nombre
        this.petService.getAllPetsByClientIdIncludingInactive(this.clientId).subscribe({
          next: (allPets: PetDTO[]) => {
            const pet = allPets.find(p => p.id === petId);
            const petName = pet ? pet.name : 'la mascota';

            // Primera confirmación
            Swal.fire({
              title: '¿Estás seguro?',
              text: `¿Deseas reactivar a ${petName}?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sí',
              cancelButtonText: 'No',
              background: '#fff',
              color: '#333',
              confirmButtonColor: '#66bb6a',
              cancelButtonColor: '#45AEDD',
              iconColor: '#66bb6a',
              reverseButtons: false
            }).then((firstResult) => {
              if (firstResult.isConfirmed) {
                // Segunda confirmación con botones invertidos
                Swal.fire({
                  title: '¿Realmente estás seguro?',
                  text: `Esta acción reactivará a ${petName}. ¿Confirmas esta acción?`,
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Sí',
                  cancelButtonText: 'No',
                  background: '#fff',
                  color: '#333',
                  confirmButtonColor: '#66bb6a',
                  cancelButtonColor: '#45AEDD',
                  iconColor: '#66bb6a',
                  reverseButtons: true
                }).then((secondResult) => {
                  if (secondResult.isConfirmed) {
                    // El usuario presionó "Sí" en la segunda pregunta
                    this.performReactivatePet(petId);
                  }
                });
              }
            });
          }
        });
      },
      error: (error) => {
        console.error('Error al validar mascotas activas:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo validar el estado de las mascotas activas',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    });
  }

  private performReactivatePet(petId: number): void {
    this.petService.reactivatePet(petId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Mascota reactivada',
          text: 'La mascota ha sido reactivada exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        }).then(() => {
          // Recargar la lista de mascotas activas
          this.loadPets();
          // Volver a mostrar el listado de mascotas dadas de baja actualizado
          this.showInactivePets();
        });
      },
      error: (error) => {
        console.error('Error al reactivar la mascota:', error);
        console.error('Error completo:', JSON.stringify(error, null, 2));
        console.error('Status:', error.status);
        console.error('Error message:', error.error);
        
        let errorMessage = 'No se pudo reactivar la mascota. Por favor, intenta nuevamente.';
        
        // Si el error es por límite de mascotas
        if (error.status === 400 || error.status === 409) {
          errorMessage = 'Un cliente puede tener un máximo de 5 mascotas activas. No se puede reactivar esta mascota.';
        } else if (error.status === 404) {
          errorMessage = 'No se encontró la mascota. Por favor, verifica que la mascota exista.';
        } else if (error.status === 403) {
          errorMessage = 'No tienes permisos para reactivar esta mascota.';
        } else if (error.error) {
          // Intentar extraer el mensaje del error
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.detail) {
            errorMessage = error.error.detail;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          } else if (error.error.title && error.error.title === 'Too Many Pets') {
            errorMessage = 'Un cliente puede tener un máximo de 5 mascotas activas. No se puede reactivar esta mascota.';
          }
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        }).then(() => {
          // Volver a mostrar el listado de mascotas dadas de baja
          this.showInactivePets();
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client/list']);
  }

  openDiagnosesHistoryModal(petId: number): void {
    const dialogRef = this.dialog.open(DiagnosesHistoryModal, {
      width: '800px',
      maxWidth: '90vw',
      data: { petId },
      panelClass: 'diagnose-history-dialog-panel',
      autoFocus: false
    });
  }
}

