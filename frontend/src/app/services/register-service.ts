import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterDTO } from '../models/dto/RegisterDTO';


@Injectable({
  providedIn: 'root'
})
export class RegisterService {

  readonly API = 'http://localhost:8080/register/new/client'

  constructor(private http : HttpClient){}

  registerClient(client : RegisterDTO){
    return this.http.post<String>(this.API, client);
  }
}
