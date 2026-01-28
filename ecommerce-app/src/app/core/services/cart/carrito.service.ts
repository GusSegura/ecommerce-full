import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {

  private API = `${environment.BACK_URL}cart/my`;

  private contadorSubject = new BehaviorSubject<number>(0);
  contador$ = this.contadorSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartCount();
  }

  // --- private helpers ---
  private loadCartCount() {
    this.http.get<any>(this.API).subscribe({
      next: cart => this.contadorSubject.next((cart?.products || []).length),
      error: () => this.contadorSubject.next(0)
    });
  }

  // Método público para forzar recarga desde componentes (ej: después de login/logout)
  refreshCartCount() {
    this.loadCartCount();
  }

  // Obtener carrito completo
  getCarrito() {
    return this.http.get<any>(this.API);
  }

  // Agregar producto a BD -> devuelve Observable; actualiza contador con tap
agregarProducto(productId: string, quantity: number = 1) {
  return this.http.post<any>(`${this.API}/add`, { productId, quantity }).pipe(
    tap(cart => {
      if (cart?.products) {
        this.contadorSubject.next(cart.products.length);
      } else {
        const actual = this.contadorSubject.value;
        this.contadorSubject.next(actual + 1);
      }
    })
  );
}

  // Eliminar un producto -> devuelve Observable; actualiza contador con tap
  eliminarProducto(productId: string) {
    return this.http.delete<any>(`${this.API}/remove/${productId}`).pipe(
      tap(cart => {
        if (cart && (cart.products || Array.isArray(cart))) {
          const len = Array.isArray(cart.products) ? cart.products.length : (cart?.length ?? 0);
          this.contadorSubject.next(len);
        } else {
          // si el backend no devuelve carrito, recargamos por si acaso
          this.loadCartCount();
        }
      })
    );
  }

  // Vaciar carrito del usuario -> devuelve Observable; actualiza contador con tap
  vaciarCarrito() {
    return this.http.delete<any>(`${this.API}/clear`).pipe(
      tap(() => this.contadorSubject.next(0))
    );
  }

  resetCarrito() {
  this.contadorSubject.next(0);
}

actualizarCantidad(productId: string, quantity: number) {
  return this.http.patch<any>(`${this.API}/update/${productId}`, { quantity }).pipe(
    tap(() => this.loadCartCount())
  );
}

}
