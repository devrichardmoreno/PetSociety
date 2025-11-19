import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { DiagnoseDto } from '../../../../models/dto/diagnose/diagnose-dto';
import { PetEmojiUtil } from '../../../../utils/pet-emoji.util';
import { PetType, PetTypeLabels } from '../../../../models/enums/pet-type.enum';
import { Reason } from '../../../../models/enums/reason.enum';

@Component({
  selector: 'app-diagnose-detail-modal',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './diagnose-detail-modal.html',
  styleUrl: './diagnose-detail-modal.css'
})
export class DiagnoseDetailModal {
  
  constructor(
    private dialogRef: MatDialogRef<DiagnoseDetailModal>,
    @Inject(MAT_DIALOG_DATA) public data: { 
      diagnose: DiagnoseDto & { 
        date: Date; 
        appointmentStartDate?: Date | null; 
        appointmentEndDate?: Date | null 
      } 
    }
  ) {}

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

  getReasonLabel(reason?: Reason | string): string {
    if (!reason) return '';
    const reasonLabels: { [key in Reason]: string } = {
      [Reason.CONTROL]: 'Control',
      [Reason.VACCINATION]: 'Vacunación',
      [Reason.EMERGENCY]: 'Urgencia',
      [Reason.NUTRITION]: 'Nutrición'
    };
    if (typeof reason === 'string' && reason in reasonLabels) {
      return reasonLabels[reason as Reason];
    }
    return reason.toString();
  }

  close(): void {
    this.dialogRef.close();
  }
}

