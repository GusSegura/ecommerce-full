import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ropa, ProductResponse } from '../../types/ropa';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.BACK_URL}products`;

  constructor(private httpClient: HttpClient) { }

  getRopa(page: number = 1, limit: number = 10): Observable<ProductResponse> {
    return this.httpClient
      .get<ProductResponse>(this.baseUrl, { params: { page, limit } })
      .pipe(catchError((error) => throwError(() => new Error(error))));
  }

  fnMujer(): Observable<Ropa[]> {
    return this.http.get<Ropa[]>(`${this.baseUrl}/by-category/Mujeres`);
  }

  fnHombre(): Observable<Ropa[]> {
    return this.http.get<Ropa[]>(`${this.baseUrl}/by-category/Hombres`);
  }

  fnKids(): Observable<Ropa[]> {
    return this.http.get<Ropa[]>(`${this.baseUrl}/by-category/Kids`);
  }

  fnAccesorios(): Observable<Ropa[]> {
    return this.http.get<Ropa[]>(`${this.baseUrl}/by-category/Accesorios`);
  }

  getById(id: string): Observable<Ropa> {
    return this.http.get<Ropa>(`${this.baseUrl}/${id}`);
  }

  // Crear producto con imágenes (FormData)
  create(formData: FormData): Observable<Ropa> {
    return this.http.post<Ropa>(this.baseUrl, formData);
  }

  // Crear producto sin imágenes (JSON)
  createJSON(producto: Partial<Ropa>): Observable<Ropa> {
    return this.http.post<Ropa>(this.baseUrl, producto);
  }

  // Actualizar producto con imágenes (FormData)
  updateWithImages(id: string, formData: FormData): Observable<Ropa> {
    return this.http.put<Ropa>(`${this.baseUrl}/${id}`, formData);
  }

  // Actualizar producto sin imágenes (JSON)
  update(id: string, producto: Partial<Ropa>): Observable<Ropa> {
    return this.http.put<Ropa>(`${this.baseUrl}/${id}`, producto);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  searchProducts(query: string): Observable<any> {
    return this.http.get(`${environment.BACK_URL}products/search`, {
      params: { q: query }
    });
  }
}