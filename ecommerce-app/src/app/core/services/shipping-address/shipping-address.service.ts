import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ShippingAddressService {
  private API = 'http://localhost:3000/api/shipping-address';
  
  constructor(private http: HttpClient) {}
  
  create(data: any) {
    return this.http.post<any>(this.API, data);
  }
}

