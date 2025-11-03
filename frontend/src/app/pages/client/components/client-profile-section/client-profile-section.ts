import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserData } from '../../../../models/UserData';

@Component({
  selector: 'app-client-profile-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-profile-section.html',
  styleUrl: './client-profile-section.css'
})
export class ClientProfileSection {
  @Input() userData!: UserData;
}

