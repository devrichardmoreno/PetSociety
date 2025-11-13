import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CommonModule} from '@angular/common';
import { MatAnchor } from "@angular/material/button";
import { DiagnoseDto, mapDiagnoseDateToDate } from '../../../models/dto/diagnose-dto/diagnose-dto';
import { DiagnosesService } from '../../../services/diagnoses/diagnoses-service';


@Component({
  selector: 'app-diagnoses-history-modal',
  imports: [CommonModule, MatAnchor],
  templateUrl: './diagnoses-history-modal.html',
  styleUrls: ['./diagnoses-history-modal.css']
})
export class DiagnosesHistoryModal implements OnInit{

  lastestDiagnoses: DiagnoseDto[] = [];
  loadingDiagnoses = false;
  diagnosesError: String | null = null;
  diagnosesPage = { 
    page: 0,
    size: 5,
    totalPages: 0,
    totalElements: 0
  };

  constructor(
    private diagnosesService : DiagnosesService,
    private dialogRef: MatDialogRef<DiagnosesHistoryModal>,
    @Inject(MAT_DIALOG_DATA) public data: {petId: number}
  ){

  }

  ngOnInit(): void {
    this.loadDiagnoses();
  }

  loadDiagnoses(page: number = 0): void {

    this.loadingDiagnoses = true;
    this.diagnosesError = null;

    this.diagnosesService.getLastestDiagnosesByPet(this.data.petId, page, this.diagnosesPage.size)
    .subscribe({
      next: (response) => {
        this.lastestDiagnoses = response.content.map(dto => mapDiagnoseDateToDate(dto));
        this.diagnosesPage.totalPages = response.totalPages;
        this.diagnosesPage.totalElements = response.totalElements;
        this.diagnosesPage.page = response.number;
      },
      error: (err) => {

        if(err.status ===404){
          this.diagnosesError = 'No se encontraron diagnósticos para esta mascota.';
        }
        else if(err.status ===500){
          this.diagnosesError = 'Error del servidor. Por favor, inténtelo de nuevo más tarde.';
        }
        else{
          this.diagnosesError = 'Error desconocido. Por favor, inténtelo de nuevo.';
        }

        this.loadingDiagnoses = false;
      },
      complete: () => {
        this.loadingDiagnoses = false;
      }
    });
  }

  nextPage(): void {
    if(this.diagnosesPage.page < this.diagnosesPage.totalPages - 1){
      this.loadDiagnoses(this.diagnosesPage.page + 1);
    }
  }

  prevPage(): void {
    if(this.diagnosesPage.page > 0){
      this.loadDiagnoses(this.diagnosesPage.page -1)
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
