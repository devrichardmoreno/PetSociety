import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InterfaceRegister } from '../../models/interface-register';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [RouterLink,ReactiveFormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css'
})
export class RegisterComponent implements OnInit {

  registerForm! : FormGroup;


  constructor(
    private router: Router,
    private authService: Auth,
    private fb:FormBuilder
  ){}

  ngOnInit(): void {
      this.registerForm= this.fb.group({

        // @NotNull -> Validators.required
            username: ['', [Validators.required]],
            
            // @NotNull, @Size(min=2, max=50)
            password: ['', [
                Validators.required, 
                Validators.minLength(2), 
                Validators.maxLength(50)
            ]],
            
            // @NotNull, @Size(min=2, max=50)
            name: ['', [
                Validators.required, 
                Validators.minLength(2), 
                Validators.maxLength(50)
            ]],
            
            // @NotNull, @Size(min=2, max=50)
            surname: ['', [
                Validators.required, 
                Validators.minLength(2), 
                Validators.maxLength(50)
            ]],
            
            // @NotNull, @Size(min=9, max=20)
            phone: ['', [
                Validators.required, 
                Validators.minLength(9), 
                Validators.maxLength(20)
            ]],
            
            // @NotNull, @Size(min=7, max=8)
            dni: ['', [
                Validators.required, 
                Validators.minLength(7), 
                Validators.maxLength(8)
            ]],
            
            // @NotNull, @Email
            email: ['', [
                Validators.required, 
                Validators.email
            ]]
        })

  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
        alert('Por favor, completa el formulario correctamente.');
        return;
    }

    // Asegura que el payload sea del tipo de tu interfaz
    const payload: InterfaceRegister = this.registerForm.value;

    this.authService.register(payload).subscribe({
        next: (response) => {
            console.log('✅ Registro Exitoso:', response);
            alert('¡Registro completado! Serás redirigido.');
            this.router.navigate(['/login']); 
        },
        error: (err) => {
            console.error('❌ Error en el registro:', err);
            const errorMessage = err.error?.message || 'Fallo de conexión o el usuario ya existe.';
            alert(`Error: ${errorMessage}`);
        }
    });
  }

 


}