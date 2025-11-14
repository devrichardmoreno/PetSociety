import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login-service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-component',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login-component.html',
  styleUrls: ['./login-component.css']
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
      const userRole = this.authService.getUserRole();
      let roleLabel = 'usuario';
      let menuRoute = '/login';

      switch(userRole) {
        case 'ROLE_CLIENT':
          roleLabel = 'Cliente';
          menuRoute = '/client/home';
          break;
        case 'ROLE_ADMIN':
          roleLabel = 'Administrador';
          menuRoute = '/admin/home';
          break;
        case 'ROLE_DOCTOR':
          roleLabel = 'Doctor';
          menuRoute = '/doctor/home';
          break;
      }

      Swal.fire({
        title: 'Sesión activa',
        html: `<p>Ya tienes una sesión activa como <strong>${username}</strong> (${roleLabel}).</p>`,
        icon: 'info',
        showCancelButton: false,
        showDenyButton: true,
        confirmButtonText: 'Ir a mi cuenta',
        denyButtonText: 'Cerrar sesión',
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: '#fff',
        color: '#333',
        confirmButtonColor: '#45AEDD',
        denyButtonColor: '#d33',
        iconColor: '#45AEDD'
      }).then((result) => {
        if (result.isConfirmed) {
          // Ir al menú del usuario
          this.router.navigate([menuRoute]);
        } else if (result.isDenied) {
          // Cerrar sesión
          this.authService.logout();
          Swal.fire({
            title: 'Sesión cerrada',
            text: 'Has cerrado sesión correctamente',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: '#fff',
            color: '#333'
          });
        }
      });
    }

    onSubmit(): void {

      if(this.loginForm.invalid){
        Swal.fire({
          icon: 'warning',
          title: 'Datos faltantes',
          text: 'Por favor completá todos los campos requeridos',
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#45AEDD',
          iconColor: '#45AEDD'
        });
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
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Rol de usuario no válido. Por favor contactá al administrador.',
                  background: '#fff',
                  color: '#333',
                  confirmButtonColor: '#d33',
                  iconColor: '#d33'
                });
            }
          }
        },
        error: (e) => {
          console.error('Error en el login:', e);
          Swal.fire({
            icon: 'error',
            title: 'Error al iniciar sesión',
            text: 'Verificá tus credenciales e intentá nuevamente',
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#d33',
            iconColor: '#d33'
          });
        }
      })
    }
}
