import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Page } from '../../models/shared/page';
import { DiagnoseDto, mapDiagnoseDateToDate } from '../../models/dto/diagnose/diagnose-dto';
import { DiagnoseRequest } from '../../models/dto/diagnose/diagnose-request';
import { DiagnosesDTOResponse } from '../../models/dto/diagnose/diagnoses-response-dto';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DiagnosesService {
  private url = 'http://localhost:8080/diagnoses';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getLatestDiagnosesByDoctor(
    doctorId: number,
    page = 0,
    size = 5,
    sort?: string
  ): Observable<Page<DiagnoseDto & { date: Date; appointmentStartDate?: Date | null; appointmentEndDate?: Date | null }>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<Page<DiagnosesDTOResponse>>(
      `${this.url}/getByDoctorId/${doctorId}`,
      { params, headers: this.getAuthHeaders() }
    ).pipe(
      map(pageResp => ({
        ...pageResp,
        content: (pageResp.content || []).map(dto => {
          const diagnoseDto: DiagnoseDto = {
            diagnose: dto.diagnose,
            treatment: dto.treatment,
            doctorName: dto.doctorName,
            petName: dto.petName,
            petType: dto.petType,
            otherType: dto.otherType,
            reason: dto.appointmentReason?.toString() || '',
            appointmentReason: dto.appointmentReason,
            date: dto.date,
            clientName: dto.clientName,
            appointmentStartTime: dto.appointmentStartTime,
            appointmentEndTime: dto.appointmentEndTime
          };
          return mapDiagnoseDateToDate(diagnoseDto);
        })
      }))
    );
  }

  getDiagnoseById(diagnoseId: number): Observable<DiagnoseDto & { date: Date }> {
    return this.http.get<DiagnosesDTOResponse>(`${this.url}/findById/${diagnoseId}`, {
      headers: this.getAuthHeaders()
    })
      .pipe(
        map(response => {
          const diagnoseDto: DiagnoseDto = {
            diagnose: response.diagnose,
            treatment: response.treatment,
            doctorName: response.doctorName,
            petName: response.petName,
            petType: response.petType,
            otherType: response.otherType,
            reason: response.appointmentReason?.toString() || '',
            appointmentReason: response.appointmentReason,
            date: response.date,
            clientName: response.clientName,
            appointmentStartTime: response.appointmentStartTime,
            appointmentEndTime: response.appointmentEndTime
          };
          return mapDiagnoseDateToDate(diagnoseDto);
        })
      );
  }

  getLastestDiagnosesByPet(
    petId: number,
    page = 0,
    size = 5,
    sort?: string
  ): Observable<Page<DiagnoseDto & { date: Date }>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<Page<DiagnosesDTOResponse>>(
      `${this.url}/getByPetId/${petId}`,
      { params }
    ).pipe(
      map(pageResp => ({
        ...pageResp,
        content: (pageResp.content || []).map(dto => {
          const diagnoseDto: DiagnoseDto = {
            diagnose: dto.diagnose,
            treatment: dto.treatment,
            doctorName: dto.doctorName,
            petName: dto.petName,
            petType: dto.petType,
            otherType: dto.otherType,
            reason: dto.appointmentReason?.toString() || '',
            appointmentReason: dto.appointmentReason,
            date: dto.date,
            clientName: dto.clientName,
            appointmentStartTime: dto.appointmentStartTime,
            appointmentEndTime: dto.appointmentEndTime
          };
          return mapDiagnoseDateToDate(diagnoseDto);
        })
      }))
    );
  }

  createDiagnose(diagnose: DiagnoseRequest): Observable<DiagnoseRequest> {
    return this.http.post<DiagnoseRequest>(
      `${this.url}/create`,
      diagnose,
      { headers: this.getAuthHeaders() }
    );
  }

  getDiagnosesByClientId(
    clientId: number,
    page = 0,
    size = 10
  ): Observable<Page<DiagnosesDTOResponse>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<Page<DiagnosesDTOResponse>>(
      `${this.url}/lastDiagnoses/${clientId}`,
      {
        headers: this.getAuthHeaders(),
        params: params
      }
    );
  }
}

