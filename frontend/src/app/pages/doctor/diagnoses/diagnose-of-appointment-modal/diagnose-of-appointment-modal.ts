import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DiagnosesService } from '../../../../services/diagnoses/diagnoses.service';
import { DiagnoseDto } from '../../../../models/dto/diagnose/diagnose-dto';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PetEmojiUtil } from '../../../../utils/pet-emoji.util';
import { PetType, PetTypeLabels } from '../../../../models/enums/pet-type.enum';

@Component({
  selector: 'app-diagnose-of-appointment-modal',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
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

  getPetEmoji(petType?: PetType | string): string {
    return PetEmojiUtil.getEmoji(petType);
  }

  getPetTypeLabel(petType?: PetType | string, otherType?: string): string {
    if (!petType) return '';
    if (petType === PetType.OTHER && otherType) {
      return otherType;
    }
    return PetTypeLabels[petType as PetType] || '';
  }

  getFullPetDisplay(diagnose: DiagnoseDto & { petType?: PetType; otherType?: string }): string {
    if (!diagnose.petType) {
      return diagnose.petName || '—';
    }
    const emoji = this.getPetEmoji(diagnose.petType);
    const typeLabel = this.getPetTypeLabel(diagnose.petType, diagnose.otherType);
    return `${emoji} ${diagnose.petName || '—'}${typeLabel ? ` (${typeLabel})` : ''}`;
  }
}

