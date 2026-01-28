import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface Cliente {
  _id?: string;
  displayName: string;
  email: string;
  password?: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive?: boolean;
  avatar?: string;
}

export interface ClientesResponse {
  users: Cliente[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    totalResults?: number; // opcional, solo si el backend lo devuelve
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private baseUrl = `${environment.BACK_URL}users`;

  constructor(private http: HttpClient) {}

 

  getAll(page: number = 1, limit: number = 10): Observable<ClientesResponse> {
    return this.http.get<ClientesResponse>(this.baseUrl, {
      params: { 
        page: page.toString(), 
        limit: limit.toString()
        // role: 'customer' 👈 solo si tu backend filtra por rol
      }
    });
  }

  getById(id: string): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  create(cliente: Partial<Cliente>): Observable<Cliente> {
    const clienteData = {
      ...cliente,
      role: 'customer' // 👈 aseguramos que siempre se cree como cliente
    };
    return this.http.post<Cliente>(this.baseUrl, clienteData);
  }


  update(id: string, cliente: Partial<Cliente>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.baseUrl}/${id}`, cliente);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  search(query: string): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/search`, {
      params: { q: query, role: 'customer' }
    });
  }

  getByStatus(isActive: boolean): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.baseUrl}/status/${isActive}`, {
      params: { role: 'customer' }
    });
  }
}
