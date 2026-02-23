import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagnosesService } from '../../../services/diagnoses/diagnoses.service';
import { AuthService } from '../../../services/auth/auth.service';
import { PetService } from '../../../services/pet/pet.service';
import { DiagnosesDTOResponse } from '../../../models/dto/diagnose/diagnoses-response-dto';
import { Reason } from '../../../models/enums/reason.enum';
import { PetType } from '../../../models/enums/pet-type.enum';
import { HeaderClient } from '../../../components/headers/client-header/header-client';
import { PetEmojiUtil } from '../../../utils/pet-emoji.util';
import { Page } from '../../../models/shared/page';
import Swal from 'sweetalert2';
import { getFriendlyErrorMessage } from '../../../utils/error-handler';

@Component({
  selector: 'app-client-diagnoses',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderClient],
  templateUrl: './client-diagnoses.html',
  styleUrls: ['./client-diagnoses.css']
})
export class ClientDiagnosesComponent implements OnInit {
  // Exponer enum para uso en template
  Reason = Reason;
  
  allDiagnoses: DiagnosesDTOResponse[] = [];
  displayedDiagnoses: DiagnosesDTOResponse[] = [];
  
  // Paginación
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  loading = false;
  
  // Filtros
  selectedPetName: string | 'ALL' = 'ALL';
  selectedDoctorName: string | 'ALL' = 'ALL';
  selectedReason: Reason | 'ALL' = 'ALL';
  startDate: string = '';
  endDate: string = '';
  
  // Listas únicas para filtros
  uniquePets: string[] = [];
  uniqueDoctors: string[] = [];
  
  // Modal de detalles
  selectedDiagnosis: DiagnosesDTOResponse | null = null;
  showDetailsModal = false;

  constructor(
    private diagnosesService: DiagnosesService,
    private authService: AuthService,
    private petService: PetService
  ) {}

  ngOnInit(): void {
    this.loadDiagnoses();
  }

  loadDiagnoses(page: number = 0): void {
    const clientId = this.authService.getUserId();
    if (!clientId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo obtener el ID del cliente'
      });
      return;
    }

    this.loading = true;
    this.diagnosesService.getDiagnosesByClientId(clientId, page, this.pageSize).subscribe({
      next: (pageResponse: Page<DiagnosesDTOResponse>) => {
        this.allDiagnoses = pageResponse.content;
        this.totalPages = pageResponse.totalPages;
        this.totalElements = pageResponse.totalElements;
        this.currentPage = pageResponse.number;
        
        this.extractUniqueValues();
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        const errorMessage = getFriendlyErrorMessage(error);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          background: '#fff',
          color: '#333',
          confirmButtonColor: '#F47B20',
          iconColor: '#000000'
        });
      }
    });
  }

  extractUniqueValues(): void {
    const petsSet = new Set<string>();
    const doctorsSet = new Set<string>();
    
    this.allDiagnoses.forEach(diagnosis => {
      petsSet.add(diagnosis.petName);
      doctorsSet.add(diagnosis.doctorName);
    });
    
    this.uniquePets = Array.from(petsSet).sort();
    this.uniqueDoctors = Array.from(doctorsSet).sort();
  }

  applyFilters(): void {
    // Filtrar los diagnósticos de la página actual
    const filtered = this.allDiagnoses.filter(diagnosis => {
      const petMatch = this.selectedPetName === 'ALL' || diagnosis.petName === this.selectedPetName;
      const doctorMatch = this.selectedDoctorName === 'ALL' || diagnosis.doctorName === this.selectedDoctorName;
      const reasonMatch = this.selectedReason === 'ALL' || diagnosis.appointmentReason === this.selectedReason;
      
      // Filtro de fecha
      let dateMatch = true;
      if (this.startDate || this.endDate) {
        const diagnosisDate = new Date(diagnosis.date);
        diagnosisDate.setHours(0, 0, 0, 0);
        
        if (this.startDate) {
          const startDateFilter = new Date(this.startDate);
          startDateFilter.setHours(0, 0, 0, 0);
          if (diagnosisDate < startDateFilter) {
            dateMatch = false;
          }
        }
        
        if (this.endDate && dateMatch) {
          const endDateFilter = new Date(this.endDate);
          endDateFilter.setHours(23, 59, 59, 999);
          if (diagnosisDate > endDateFilter) {
            dateMatch = false;
          }
        }
      }
      
      return petMatch && doctorMatch && reasonMatch && dateMatch;
    });

    // Ordenar por fecha descendente (más recientes primero)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    this.displayedDiagnoses = filtered;
  }

  onPetFilterChange(petName: string | 'ALL'): void {
    this.selectedPetName = petName;
    this.currentPage = 0;
    this.applyFilters();
  }

  onDoctorFilterChange(doctorName: string | 'ALL'): void {
    this.selectedDoctorName = doctorName;
    this.currentPage = 0;
    this.applyFilters();
  }

  onReasonFilterChange(reason: Reason | 'ALL'): void {
    this.selectedReason = reason;
    this.currentPage = 0;
    this.applyFilters();
  }

  onStartDateChange(date: string): void {
    this.startDate = date;
    this.currentPage = 0;
    this.applyFilters();
  }

  onEndDateChange(date: string): void {
    this.endDate = date;
    this.currentPage = 0;
    this.applyFilters();
  }

  clearDateFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 0;
    this.applyFilters();
  }

  getReasonLabel(reason: Reason): string {
    switch (reason) {
      case Reason.CONTROL:
        return 'Control';
      case Reason.EMERGENCY:
        return 'Emergencia';
      case Reason.VACCINATION:
        return 'Vacunación';
      case Reason.NUTRITION:
        return 'Nutrición';
      default:
        return reason;
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDiagnosisPreview(diagnosis: string, maxLength: number = 100): string {
    if (diagnosis.length <= maxLength) {
      return diagnosis;
    }
    return diagnosis.substring(0, maxLength) + '...';
  }

  downloadDiagnosisPdf(diagnoseId: number): void {
    this.diagnosesService.downloadDiagnosisPdf(diagnoseId).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `diagnóstico-${diagnoseId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (error) => {
        console.error('Error al descargar PDF:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo descargar el PDF del diagnóstico'
        });
      }
    });
  }

  openDetailsModal(diagnosis: DiagnosesDTOResponse): void {
    this.selectedDiagnosis = diagnosis;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedDiagnosis = null;
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadDiagnoses(page);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(0, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(this.totalPages - 1, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  getPetEmoji(petType: PetType): string {
    return PetEmojiUtil.getEmoji(petType);
  }
}

