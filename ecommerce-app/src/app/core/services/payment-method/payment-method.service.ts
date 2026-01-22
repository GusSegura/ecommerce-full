import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private API = 'http://localhost:3000/api/payment-method';
  
  constructor(private http: HttpClient) {}
  
  create(data: any) {
    return this.http.post<any>(this.API, data);
  }
}