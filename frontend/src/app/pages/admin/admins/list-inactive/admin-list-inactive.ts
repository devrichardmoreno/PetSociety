import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../../services/admin/admin.service';
import { Admin } from '../../../../models/entities/admin';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-list-inactive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-list-inactive.html',
  styleUrls: ['./admin-list-inactive.css']
})
export class AdminListInactiveComponent implements OnInit {

  admins: Admin[] = [];
  filteredAdmins: Admin[] = [];
  loading: boolean = true;
  errorMessage: string = '';
  searchTerm: string = '';

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAdmins();
  }

  loadAdmins(): void {
    this.adminService.getAllInactiveAdmins().subscribe({
      next: (data: any[]) => {
        this.admins = data.map((admin: any) => ({
          id: admin.id,
          name: admin.name,
          surname: admin.surname,
          dni: admin.dni,
          phone: admin.phone,
          email: admin.email,
          subscribed: admin.subscribed
        }));
        this.filteredAdmins = this.admins;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error al obtener administradores inactivos:', error);
        this.errorMessage = 'No se pudieron cargar los administradores dados de baja.';
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredAdmins = this.admins;
      return;
    }

    const search = this.searchTerm.toLowerCase().trim();
    const searchWords = search.split(/\s+/);

    this.filteredAdmins = this.admins.filter(admin => {
      const fullName = `${admin.name} ${admin.surname}`.toLowerCase();
      const reverseFullName = `${admin.surname} ${admin.name}`.toLowerCase();
      const name = admin.name?.toLowerCase() || '';
      const surname = admin.surname?.toLowerCase() || '';

      // Si hay una sola palabra, buscar en nombre o apellido
      if (searchWords.length === 1) {
        return name.includes(search) || surname.includes(search);
      }

      // Si hay múltiples palabras, buscar nombre + apellido o apellido + nombre
      const searchPhrase = searchWords.join(' ');
      return fullName.includes(searchPhrase) || reverseFullName.includes(searchPhrase);
    });
  }

  reactivateAdmin(admin: Admin): void {
    if (!admin.id) {
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

    const adminName = `${admin.name} ${admin.surname}`;

    // Primera confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas reactivar al administrador ${adminName}?`,
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
          text: `Esta acción reactivará al administrador ${adminName}. ¿Confirmas esta acción?`,
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
            this.performReactivate(admin.id!);
          }
        });
      }
    });
  }

  private performReactivate(adminId: number): void {
    this.adminService.reactivateAdmin(adminId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Administrador reactivado',
          text: 'El administrador ha sido reactivado exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
        // Recargar la lista de administradores
        this.loadAdmins();
      },
      error: (error: any) => {
        console.error('Error al reactivar al administrador:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo reactivar al administrador. Por favor, intenta nuevamente.',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
      }
    });
  }
}

