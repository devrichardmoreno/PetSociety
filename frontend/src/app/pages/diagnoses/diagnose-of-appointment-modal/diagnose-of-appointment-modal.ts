import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DiagnosesService } from '../../../services/diagnoses/diagnoses-service';
import { DiagnoseDto } from '../../../models/dto/diagnose-dto/diagnose-dto';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-diagnose-of-appointment-modal',
  imports: [CommonModule],
  templateUrl: './diagnose-of-appointment-modal.html',
  styleUrl: './diagnose-of-appointment-modal.css'
})
export class DiagnoseOfAppointmentModal implements OnInit {

  loading = true;
  error: string | null = null;
  diagnoseDetails : DiagnoseDto | null = null;


  constructor(
    private diagnosesService: DiagnosesService,
    public dialogRef: MatDialogRef<DiagnoseOfAppointmentModal>,
    @Inject(MAT_DIALOG_DATA) public data: {diagnoseId: number}
  ) {}

  ngOnInit(): void {
    this.loadDiagnose();
  }

  private loadDiagnose(): void {
    this.diagnosesService.getDiagnoseById(this.data.diagnoseId).subscribe({
      next: (diagnose) => {
        this.diagnoseDetails = diagnose;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el diagnóstico.';
        this.loading = false;
        console.error('Error cargando diagnóstico:', err);
      }
    })
  }

  close(): void {
    this.dialogRef.close();
  }
}
