import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pet } from '../../../../models/Pet';

@Component({
  selector: 'app-client-pets-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-pets-list.html',
  styleUrl: './client-pets-list.css'
})
export class ClientPetsList {
  @Input() pets: Pet[] = [];
  @Output() scheduleAppointment = new EventEmitter<number>();
  @Output() editPet = new EventEmitter<number>();
  @Output() deletePet = new EventEmitter<number>();
  @Output() cancelAppointment = new EventEmitter<number>();

  get hasScheduledAppointment(): boolean {
    return this.pets.some(pet => pet.citaProgramada);
  }
}

