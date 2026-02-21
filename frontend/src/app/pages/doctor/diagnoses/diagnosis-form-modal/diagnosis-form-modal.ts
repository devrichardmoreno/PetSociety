import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DiagnosesService } from '../../../../services/diagnoses/diagnoses.service';
import { DiagnoseRequest } from '../../../../models/dto/diagnose/diagnose-request';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../../utils/error-handler';

@Component({
  selector: 'app-diagnosis-form-modal',
  imports: [ReactiveFormsModule,
     CommonModule,
     MatButtonModule,
     MatDialogModule,
     MatFormFieldModule,
     MatInputModule],
  templateUrl: './diagnosis-form-modal.html',
  styleUrl: './diagnosis-form-modal.css'
})
export class DiagnosisFormModal {

  diagnosisForm: FormGroup;

  constructor(
    private diagnoseService: DiagnosesService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<DiagnosisFormModal>,
    @Inject(MAT_DIALOG_DATA) public data: {appointmentId: number}
  ) {
    this.diagnosisForm = this.fb.group({
      diagnose: ['', Validators.required],
      treatment: ['', Validators.required]
    });
  }

  onSubmit(){
    if(this.diagnosisForm.valid){
      const diagnoseRequest : DiagnoseRequest = {
        appointmentId: this.data.appointmentId,
        ...this.diagnosisForm.value
      }
      
      this.diagnoseService.createDiagnose(diagnoseRequest).subscribe({
        next: (resp) => {
          Swal.fire({
                    icon: 'success',
                    title: '¡Diagnostico creado!',
                    text: 'Pet Society 💙🐾',
                    background: '#fff', 
                    color: '#333', 
                    confirmButtonText: 'Cerrar',
                    confirmButtonColor: '#F47B20', 
                    iconColor: '#7AC143',
                    customClass: {
                      popup: 'animate__animated animate__fadeInDown'
                    }
                  }).then(() => {
          this.dialogRef.close(resp);
        });

          
        },
        error: (err) => {
          console.error('Error completo al crear diagnóstico:', err);
          const errorMessage = getFriendlyErrorMessage(err);
          console.log('Mensaje de error procesado:', errorMessage);
          
          Swal.fire({
            icon: 'error',
            title: 'Error al crear el diagnóstico',
            text: errorMessage,
            background: '#fff',
            color: '#333',
            confirmButtonColor: '#F47B20', 
            iconColor: '#000000'
          });
        }
      })
      
    
    }
}

  onCancel(){
    this.dialogRef.close();
  }
  
}

