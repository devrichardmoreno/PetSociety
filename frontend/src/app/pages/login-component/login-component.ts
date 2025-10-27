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
          localStorage.setItem('token', response.token);
          this.router.navigate(['']);
        },
        error: (e) => {alert(e)}
      })
    }
}
