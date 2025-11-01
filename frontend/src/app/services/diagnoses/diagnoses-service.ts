import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Page } from '../../models/paging/page';
import { AppointmentDto, mapAppointmentDateToDate } from '../../models/dto/appointment-dto/appointment-dto';

@Injectable({
  providedIn: 'root'
})
export class DiagnosesService {
  private url = 'http://localhost:8080/diagnoses';

  constructor(private http: HttpClient) { }


  getLatestDiagnostics(
    doctorId: number,
    page = 0,
    size = 5,
    sort?: string
  ): Observable<Page<AppointmentDto & { date: Date }>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<Page<AppointmentDto>>(
      `${this.url}/getByDoctorId/${doctorId}`,
      { params }
    ).pipe(
      map(pageResp => ({
        ...pageResp,
        content: (pageResp.content || []).map(mapAppointmentDateToDate)
      }))
    );
  }
}
