import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../../../services/client/client.service';
import { ClientDTO } from '../../../../models/dto/client/client-dto';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-client-list-inactive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './client-list-inactive.html',
  styleUrls: ['./client-list-inactive.css']
})
export class ClientListInactiveComponent implements OnInit {

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
    this.clientService.getAllInactiveClientsWithPetsCount().subscribe({
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
        console.error('Error al obtener clientes inactivos:', error);
        this.errorMessage = 'No se pudieron cargar los clientes dados de baja.';
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

  reactivateClient(client: ClientDTO & { id?: number }): void {
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
      text: `¿Deseas reactivar al cliente ${clientName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      background: '#fff',
      color: '#333',
      confirmButtonColor: '#45AEDD',
      cancelButtonColor: '#f57c00',
      iconColor: '#45AEDD',
      reverseButtons: false
    }).then((firstResult) => {
      if (firstResult.isConfirmed) {
        // Segunda confirmación con botones invertidos
        Swal.fire({
          title: '¿Realmente estás seguro?',
          text: `Esta acción reactivará al cliente ${clientName}. ¿Confirmas esta acción?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          cancelButtonColor: '#f57c00',
          iconColor: '#45AEDD',
          reverseButtons: true
        }).then((secondResult) => {
          if (secondResult.isConfirmed) {
            this.performReactivate(client.id!);
          }
        });
      }
    });
  }

  private performReactivate(clientId: number): void {
    this.clientService.reactivateClient(clientId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente reactivado',
          text: 'El cliente ha sido reactivado exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
        // Recargar la lista de clientes
        this.loadClients();
      },
      error: (error: any) => {
        console.error('Error al reactivar al cliente:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo reactivar al cliente. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    });
  }
}

