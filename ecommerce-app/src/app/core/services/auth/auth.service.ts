import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { CarritoService } from '../cart/carrito.service';
import { Router } from '@angular/router';

export interface User {
  _id: string;
  displayName: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  isActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api';
  private API = 'http://localhost:3000/api/auth';
  private userSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private httpClient: HttpClient,
    private router: Router,
    private carritoService: CarritoService
  ) {}

  // Registro de usuario
  register(data: any) {
    return this.http.post<any>(`${this.API}/register`, data).pipe(
      tap(res => {
        // El backend devuelve solo el usuario creado
        if (res?.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }
      })
    );
  }

  // Login de usuario
  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${this.API}/login`, credentials).pipe(
      tap(res => {
        if (res?.token && res?.user) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }
      })
    );
  }

  isLogged(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserFromStorage(): User | null {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);

    this.carritoService.resetCarrito(); // resetea carrito
    this.router.navigate(['/']);
  }

  checkEmailExist(email: string): Observable<boolean> {
    return this.httpClient
      .get<{ exists: boolean }>(`${this.baseUrl}/auth/check-email`, {
        params: { email },
      })
      .pipe(map((res: { exists: boolean }) => res.exists));
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin' || user?.role === 'root';
  }
}
