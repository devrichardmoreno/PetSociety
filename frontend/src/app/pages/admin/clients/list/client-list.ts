import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../../../services/client/client.service';
import { ClientDTO } from '../../../../models/dto/client/client-dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-list.html',
  styleUrls: ['./client-list.css']
})
export class ClientListComponent implements OnInit {

  clients: ClientDTO[] = [];
  filteredClients: ClientDTO[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  searchTerm: string = '';

  constructor(
    private clientService: ClientService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener clientes:', error);
        this.errorMessage = 'No se pudieron cargar los clientes.';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredClients = this.clients;
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    const searchWords = search.split(/\s+/);

    this.filteredClients = this.clients.filter(client => {
      const fullName = `${client.name} ${client.surname}`.toLowerCase();
      const reverseFullName = `${client.surname} ${client.name}`.toLowerCase();
      const name = client.name?.toLowerCase() || '';
      const surname = client.surname?.toLowerCase() || '';

      // Si hay una sola palabra, buscar en nombre o apellido
      if (searchWords.length === 1) {
        return name.includes(search) || surname.includes(search);
      }

      // Si hay múltiples palabras, buscar nombre + apellido o apellido + nombre
      const searchPhrase = searchWords.join(' ');
      return fullName.includes(searchPhrase) || reverseFullName.includes(searchPhrase);
    });
  }

  editClient(client: ClientDTO & { id?: number }): void {
    if (client.id) {
      this.router.navigate(['/register/new/client/admin', client.id]);
    } else {
      console.error('No se pudo encontrar el ID del cliente');
    }
  }

  unsubscribeClient(client: ClientDTO & { id?: number }): void {
    if (!client.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el ID del cliente',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    const clientName = `${client.name} ${client.surname}`;

    // Primera confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas dar de baja al cliente ${clientName}?`,
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
          text: `Esta acción dará de baja al cliente ${clientName}. ¿Confirmas esta acción?`,
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
          // Con reverseButtons: true, los botones están invertidos visualmente
          // pero la lógica sigue igual: confirmButton confirma, cancelButton cancela
          // El usuario debe presionar "Sí" (confirmButton) para confirmar
          if (secondResult.isConfirmed) {
            // El usuario presionó "Sí" en la segunda pregunta
            this.performUnsubscribe(client.id!);
          }
        });
      }
    });
  }

  private performUnsubscribe(clientId: number): void {
    this.clientService.unsubscribeClient(clientId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente dado de baja',
          text: 'El cliente ha sido dado de baja exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
        // Recargar la lista de clientes
        this.loadClients();
      },
      error: (error: any) => {
        console.error('Error al dar de baja al cliente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo dar de baja al cliente. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    });
  }

  listClientPets(client: ClientDTO & { id?: number }): void {
    if (!client.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el ID del cliente',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    // Navegar a la página de listado de mascotas del cliente
    this.router.navigate(['/client', client.id, 'pets']);
  }

  addPetToClient(client: ClientDTO & { id?: number }): void {
    if (!client.id) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo encontrar el ID del cliente',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#000000'
      });
      return;
    }

    // Validar que el cliente no tenga 5 mascotas
    if (client.petsCount && client.petsCount >= 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Límite alcanzado',
        text: 'Un cliente puede tener un máximo de 5 mascotas registradas',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        iconColor: '#f57c00'
      });
      return;
    }

    // Navegar a la página de creación de mascota con el clientId como query parameter
    this.router.navigate(['/pet/create/admin'], {
      queryParams: { clientId: client.id }
    });
  }
}

