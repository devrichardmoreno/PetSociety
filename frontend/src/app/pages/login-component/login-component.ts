import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login-service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-component',
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent implements OnInit {

    loginForm!: FormGroup

    constructor(
      private loginService : LoginService,
      private authService : AuthService,
      private router : Router,
      private fb : FormBuilder,
      private activatedRoute : ActivatedRoute
    ){}

    ngOnInit(): void {
      this.loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });

      // Verificar si hay una sesión activa
      if (this.authService.isAuthenticated()) {
        const username = this.authService.getUsername();
        this.showActiveSessionModal(username);
      }
    }

    showActiveSessionModal(username: string | null): void {
      Swal.fire({
        title: 'Confirmar',
        html: `<p>Actualmente ha iniciado sesión como <strong>${username}</strong>, necesita salir antes de volver a entrar con un usuario diferente.</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Cerrar sesión',
        cancelButtonText: 'Cancelar',
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        cancelButtonColor: '#d33',
        iconColor: '#45AEDD'
      }).then((result) => {
        if (result.isConfirmed) {
          this.authService.logout();
          // El usuario ya está en la página de login, no necesitamos navegar
        }
      });
    }

    onSubmit(): void {

      if(this.loginForm.invalid){
        alert("Datos faltantes")
        return;
      }
      
      const clientData = this.loginForm.value;

      this.loginService.login(clientData).subscribe({
        next: (response) => {
          // Guardar token y userId usando el servicio de autenticación
          // El servicio también decodifica el token y guarda el rol automáticamente
          this.authService.saveAuthData(response.token, response.id);

          // Obtener el rol guardado por el servicio
          const role = this.authService.getUserRole();

          // Verificar si hay una URL de retorno (cuando el guard redirige al login)
          const returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || null;

          // Si hay returnUrl, redirigir ahí; sino, navegar según el rol
          if (returnUrl) {
            this.router.navigate([returnUrl]);
          } else {
            // Navegar según el rol
            switch(role){
              case "ROLE_CLIENT":
                this.router.navigate(['/client/home']);
                break;
              case "ROLE_ADMIN":
                this.router.navigate(['/admin/home']);
                break;
              case "ROLE_DOCTOR":
                this.router.navigate(['/doctor/home']);
                break;
              default:
                console.error('Rol no reconocido:', role);
                alert('Error: Rol de usuario no válido');
            }
          }
        },
        error: (e) => {
          console.error('Error en el login:', e);
          alert('Error al iniciar sesión. Verifica tus credenciales.');
        }
      })
    }
}
