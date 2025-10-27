import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register-service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './register-component.html',
  styleUrls: ['./register-component.css']
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;

  constructor(
    private registerService: RegisterService,
    private route: Router,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      surname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(20)]],
      dni: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(8)]],
      email: ['', [Validators.required, Validators.email]]
    });
  }

onSubmit() {
    if (this.registerForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completá todos los campos requeridos',
        background: '#fff',
        color: '#333', 
        confirmButtonColor: '#F47B20', 
        iconColor: '#000000'
      });
      return;
    }

    this.registerService.registerClient(this.registerForm.value).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada!',
          text: 'Bienvenido a Pet Society 💙🐾',
          background: '#fff', 
          color: '#333', 
          confirmButtonText: 'Ir al login',
          confirmButtonColor: '#F47B20', 
          iconColor: '#7AC143',
          customClass: {
            popup: 'animate__animated animate__fadeInDown'
          }
        }).then(() => {
          this.route.navigate(['/login']);
        });
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear la cuenta',
          text: `Ocurrió un problema: ${error.message || error.statusText || 'Error desconocido'}`,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20', 
          iconColor: '#000000'
        });
      }
    });
  }
}
