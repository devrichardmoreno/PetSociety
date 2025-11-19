import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-pet-edit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-pet-edit-form.html',
  styleUrl: './client-pet-edit-form.css'
})
export class ClientPetEditForm {
  @Input() editPetForm!: FormGroup;
  @Output() cancelEdit = new EventEmitter<void>();
  @Output() saveEdit = new EventEmitter<void>();
}

