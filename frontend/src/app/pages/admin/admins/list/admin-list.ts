import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../../services/admin/admin.service';
import { Admin } from '../../../../models/entities/admin';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../../utils/error-handler';

@Component({
  selector: 'app-admin-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-list.html',
  styleUrls: ['./admin-list.css']
})
export class AdminListComponent implements OnInit {

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
    this.adminService.getAllActiveAdmins().subscribe({
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
      error: (error) => {
        console.error('Error al obtener administradores:', error);
        this.errorMessage = 'No se pudieron cargar los administradores.';
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

  deleteAdmin(admin: Admin): void {
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
      text: `¿Deseas dar de baja al administrador ${adminName}?`,
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
          text: `Esta acción dará de baja al administrador ${adminName}. ¿Confirmas esta acción?`,
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
            this.performUnsubscribe(admin.id!);
          }
        });
      }
    });
  }

  private performUnsubscribe(adminId: number): void {
    this.adminService.unsubscribeAdmin(adminId).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Administrador dado de baja',
          text: 'El administrador ha sido dado de baja exitosamente',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#000000'
        });
        // Recargar la lista de administradores
        this.loadAdmins();
      },
      error: (error) => {
        console.error('Error al dar de baja al administrador:', error);
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

