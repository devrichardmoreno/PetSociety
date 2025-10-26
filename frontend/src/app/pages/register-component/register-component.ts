import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterService } from '../../services/register-service';

@Component({
  selector: 'app-register-component',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.css'
})
export class RegisterComponent implements OnInit {

  registerForm! : FormGroup;

  constructor(
    private registerService : RegisterService,
    private route : Router,
    private fb : FormBuilder,
    private activatedRoute : ActivatedRoute
  ){}

  ngOnInit(): void {
      this.registerForm = this.fb.group({
        username : ['',Validators.required],
        password : ['',Validators.required],
        name : ['',Validators.required],
        surname : ['',Validators.required],
        phone : ['',Validators.required],
        dni : ['',Validators.required],
        email : ['',Validators.required]
      })
    }

    onSubmit(){
      this.registerService.registerClient(this.registerForm.value).subscribe({
        next: (data) => {alert("Creado correctamente")
          this.route.navigate(['/login'])
        },
        error: (error) => {alert("Error al crear" + error.message +error.status)}
      })
    }

  


}