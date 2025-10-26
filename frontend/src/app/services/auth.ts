import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private API_URL= 'http://localhost:8080/api/auth/register'

  constructor(private http: HttpClient){}

  register(userData: any): Observable<any>{
    return this.http.post(this.API_URL, userData);
  }
  
}
