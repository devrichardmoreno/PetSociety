import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pet } from '../../../../models/Pet';
import { PetType, PetTypeLabels } from '../../../../models/dto/pet-type.enum';
import { PetEmojiUtil } from '../../../../utils/pet-emoji.util';

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

  getPetTypeLabel(petType: PetType, otherType?: string): string {
    if (petType === PetType.OTHER && otherType) {
      return otherType;
    }
    return PetTypeLabels[petType] || petType;
  }

  getPetTypeEmoji(petType: PetType): string {
    return PetEmojiUtil.getEmoji(petType);
  }
}

