import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CarritoService } from '../../core/services/cart/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  carrito: any[] = [];
  total: number = 0;

  constructor(private router: Router, private carritoService: CarritoService) {}

  ngOnInit() {
    this.cargarCarrito();
  }

cargarCarrito() {
  this.carritoService.getCarrito().subscribe(cart => {

    this.carrito = cart.products;

    this.total = this.carrito.reduce(
      (sum, item) => sum + (item.product.price * item.quantity),
      0
    );
  });
}


vaciarCarrito() {
  this.carritoService.vaciarCarrito().subscribe({
    next: () => {
      // volver a cargar desde el backend (asegura consistencia)
      this.cargarCarrito();
    },
    error: err => console.error('Error vaciando carrito', err)
  });
}

eliminarProducto(item: any) {
  this.carritoService.eliminarProducto(item.product._id).subscribe({
    next: (cartResp) => {
      // si backend devuelve carrito actualizado, recargamos, si no, recargar de todas formas
      this.cargarCarrito();
    },
    error: err => console.error('Error eliminando producto', err)
  });
}

  irAlCheckout() {
    this.router.navigate(['/checkout']);
  }

actualizarCantidad(item: any, cambio: number) {
  const nuevaCantidad = item.quantity + cambio;

  if (nuevaCantidad <= 0) {
    this.eliminarProducto(item);
    return;
  }

  if (nuevaCantidad > item.product.stock) {
    alert(`No puedes agregar más de ${item.product.stock} unidades de ${item.product.name}`);
    return;
  }

  this.carritoService.actualizarCantidad(item.product._id, nuevaCantidad)
    .subscribe({
      next: () => this.cargarCarrito(),
      error: err => console.error('Error actualizando cantidad', err)
    });
}



}

