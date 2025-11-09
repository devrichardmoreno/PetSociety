import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Page } from '../../models/paging/page';
import { DiagnoseDto, mapDiagnoseDateToDate } from '../../models/dto/diagnose-dto/diagnose-dto';
import { DiagnoseRequest } from '../../models/dto/diagnose-dto/diagnose-request';

@Injectable({
  providedIn: 'root'
})
export class DiagnosesService {
  private url = 'http://localhost:8080/diagnoses';

  constructor(private http: HttpClient) { }


  getLatestDiagnosesByDoctor(
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

  getLastestDiagnosesByPet(
    petId: number,
    page = 0,
    size = 5,
    sort?: string
  ): Observable<Page<DiagnoseDto & { date: Date }>>{
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<Page<DiagnoseDto>>(
      `${this.url}/getByPetId/${petId}`,
      { params }
    ).pipe(
      map(pageResp => ({
        ...pageResp,
        content: (pageResp.content || []).map(mapDiagnoseDateToDate)
      }))
    );
  }

  createDiagnose(diagnose :DiagnoseRequest): Observable<DiagnoseRequest> {
    return this.http.post<DiagnoseRequest>(`${this.url}/create`, diagnose);
  }
}
