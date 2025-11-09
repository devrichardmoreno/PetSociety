import { Component, OnInit } from '@angular/core';
import { DoctorService } from '../../services/doctor-service';
import { Doctor } from '../../models/doctor';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.html',
  styleUrls: ['./doctor-list.css']
})
export class DoctorListComponent implements OnInit {

  doctors: Doctor[] = [];
  loading: boolean = true;
  errorMessage: string = '';

  constructor(private doctorService: DoctorService) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.doctorService.getAllDoctors().subscribe({
      next: (data) => {
        this.doctors = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al obtener doctores:', error);
        this.errorMessage = 'No se pudieron cargar los doctores.';
        this.loading = false;
      }
    });
  }
}
