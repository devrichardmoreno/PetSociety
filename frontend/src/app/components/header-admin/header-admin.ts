import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header-admin',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header-admin.html',
  styleUrl: './header-admin.css'
})
export class HeaderAdmin {
   constructor(
    private authService: AuthService,
    private router: Router
  ) {}

   logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
