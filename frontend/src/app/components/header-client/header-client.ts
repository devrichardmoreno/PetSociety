import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header-client',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header-client.html',
  styleUrl: './header-client.css'
})
export class HeaderClient {
  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    // TODO: Implementar lógica de logout cuando tengamos autenticación
    console.log('Cerrar sesión');
  }
}
