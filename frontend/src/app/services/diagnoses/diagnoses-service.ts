import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Page } from '../../models/paging/page';
import { DiagnoseDto, mapDiagnoseDateToDate } from '../../models/dto/diagnose-dto/diagnose-dto';
import { DiagnosesDTOResponse } from '../../models/dto/diagnoses-response-dto';
import { AuthService } from '../auth.service';

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

  getLatestDiagnoses(
    doctorId: number,
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

    return this.http.get<Page<DiagnoseDto>>(
      `${this.url}/getByDoctorId/${doctorId}`,
      { params }
    ).pipe(
      map(pageResp => ({
        ...pageResp,
        content: (pageResp.content || []).map(mapDiagnoseDateToDate)
      }))
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
