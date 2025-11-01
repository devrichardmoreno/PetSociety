import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-doctor',
  imports: [RouterLink],
  templateUrl: './header-doctor.html',
  styleUrl: './header-doctor.css'
})
export class HeaderDoctor {
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    // TODO: Implementar lógica de logout cuando tengamos autenticación
    console.log('Cerrar sesión');
  }
}
