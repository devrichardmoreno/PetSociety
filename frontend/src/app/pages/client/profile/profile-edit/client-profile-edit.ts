import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-profile-edit.html',
  styleUrl: './client-profile-edit.css'
})
export class ClientProfileEdit {
  @Input() editForm!: FormGroup;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
}

