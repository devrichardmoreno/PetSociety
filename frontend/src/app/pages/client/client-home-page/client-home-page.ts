import { Component } from '@angular/core';
import { HeaderClient } from '../../../components/header-client/header-client';
import { CommonModule } from '@angular/common';

interface Pet {
  id: number;
  nombre: string;
  edad: number;
  citaProgramada?: {
    fecha: string;
    hora: string;
    doctor: string;
    motivo: string;
  };
}

interface UserData {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
}

@Component({
  selector: 'app-client-home-page',
  imports: [HeaderClient, CommonModule],
  templateUrl: './client-home-page.html',
  styleUrl: './client-home-page.css'
})
export class ClientHomePage {
  activeTab: 'mascotas' | 'datos-personales' = 'mascotas';

  // Datos mockeados del usuario
  userData: UserData = {
    nombre: 'Luciano',
    apellido: 'Morales Cuevas',
    dni: '44860308',
    telefono: '2231234567',
    email: 'Luciano@mail.com'
  };

  // Datos mockeados de mascotas
  pets: Pet[] = [
    {
      id: 1,
      nombre: 'Firulais',
      edad: 2
    },
    {
      id: 2,
      nombre: 'Fatiga',
      edad: 5,
      citaProgramada: {
        fecha: '03/11/2025',
        hora: '19:30hs',
        doctor: 'Dr. Juan Pérez',
        motivo: 'Control general y vacunación anual'
      }
    }
  ];

  get userName(): string {
    return `${this.userData.nombre} ${this.userData.apellido}`;
  }

  get hasScheduledAppointment(): boolean {
    return this.pets.some(pet => pet.citaProgramada);
  }

  get petWithAppointment(): Pet | undefined {
    return this.pets.find(pet => pet.citaProgramada);
  }

  switchTab(tab: 'mascotas' | 'datos-personales'): void {
    this.activeTab = tab;
  }

  // Métodos placeholder para las acciones
  editPet(petId: number): void {
    console.log('Editar mascota:', petId);
    // TODO: Implementar cuando tengamos la funcionalidad
  }

  deletePet(petId: number): void {
    console.log('Eliminar mascota:', petId);
    // TODO: Implementar cuando tengamos la funcionalidad
  }

  scheduleAppointment(petId: number): void {
    console.log('Agendar cita para mascota:', petId);
    // TODO: Implementar cuando tengamos la funcionalidad
  }

  editUserData(): void {
    console.log('Editar datos personales');
    // TODO: Implementar cuando tengamos la funcionalidad
  }

  cancelAppointment(petId: number): void {
    console.log('Cancelar cita para mascota:', petId);
    // TODO: Implementar cuando tengamos la funcionalidad
  }

  deleteUser(): void {
    console.log('Darse de baja');
    // TODO: Implementar cuando tengamos la funcionalidad
  }
}
