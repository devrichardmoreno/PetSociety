import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-pet-add-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-pet-add-form.html',
  styleUrl: './client-pet-add-form.css'
})
export class ClientPetAddForm {
  @Input() addPetForm!: FormGroup;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
}

