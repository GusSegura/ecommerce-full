import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../core/services/product/productos.service';
import { CarritoService } from '../../core/services/cart/carrito.service';
import { AuthService } from '../../core/services/auth/auth.service';
import { Ropa } from '../../core/types/ropa';
import { Location } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  producto: Ropa | null = null;
  imagenActual: string = '';
  cantidad: number = 1;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
    private carritoService: CarritoService,
    public auth: AuthService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarProducto(id);
    }
  }

  cargarProducto(id: string): void {
    this.productosService.getById(id).subscribe({
      next: (producto: Ropa) => {
        this.producto = producto;
        this.imagenActual = producto.imagesUrl[0];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error al cargar producto:', err);
        this.loading = false;
        this.router.navigate(['/']);
      }
    });
  }

  cambiarImagen(url: string): void {
    this.imagenActual = url;
  }

  hasStock(): boolean {
    if (!this.producto) return false;
    return (this.producto.stock ?? 0) > 0;
  }

  aumentarCantidad(): void {
    if (!this.producto) return;
    if (this.cantidad < (this.producto.stock ?? 0)) {
      this.cantidad++;
    }
  }

  disminuirCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  agregarAlCarrito(): void {
    if (!this.producto || !this.hasStock()) {
      return;
    }

    this.carritoService.agregarProducto(this.producto._id, this.cantidad).subscribe({
      next: () => {
        alert('Producto agregado al carrito');
        this.cantidad = 1;
      },
      error: (err: any) => {
        console.error('Error al agregar al carrito:', err);
        alert('No se pudo agregar el producto');
      }
    });
  }

  volver(): void {
    this.location.back();
  }
}