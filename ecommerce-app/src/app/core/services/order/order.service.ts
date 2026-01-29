import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrderService {
    private API = `${environment.BACK_URL}orders`;
  
  constructor(private http: HttpClient) {}
  
  create(data: any) {
    return this.http.post<any>(this.API, data);
  }
}