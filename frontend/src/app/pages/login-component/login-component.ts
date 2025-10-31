import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login-service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
      private router : Router,
      private fb : FormBuilder,
      private activatedRoute : ActivatedRoute
    ){}

    ngOnInit(): void {
      this.loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      })
    }

    onSubmit(): void {

      if(this.loginForm.invalid){
        alert("Datos faltantes")
      }
      
      const clientData = this.loginForm.value;

      this.loginService.login(clientData).subscribe({
        next: (response) => {
          const token = response.token;
          localStorage.setItem('token', response.token);

          try{
            const payloadBase64 = token.split('.')[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);


            const rolesArray = payload.role;

            console.log("Paylod del token: ", payload);
            
            if(rolesArray && Array.isArray(rolesArray) && rolesArray.length > 0){

              const userRole = rolesArray[0].authority;

              console.log("Rol: ", userRole)

              localStorage.setItem('userRole', userRole)
            }

          } catch(e){
            console.error("No se puedo decodigicar el token", e)
          }

          const role = localStorage.getItem('userRole')
          switch(role){
            case "ROLE_CLIENT":
              this.router.navigate(['/home-client'])
              break;
            case "ROLE_ADMIN":
              this.router.navigate(['/home-admin'])
              break
            case "ROLE_DOCTOR":
              this.router.navigate(['/doctor/home'])
              break
          }
        },
        error: (e) => {alert(e)}
      })
    }
}
