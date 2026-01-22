import { Component, Input } from '@angular/core'; 
import { Router } from '@angular/router';
import { Ropa } from '../../core/types/ropa';
import { ProductosService } from '../../core/services/product/productos.service';
import { CarritoService } from '../../core/services/cart/carrito.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-mujeres',
  standalone: true,
  imports: [],
  templateUrl: './mujeres.component.html',
  styleUrls: ['./mujeres.component.css']
})
export class MujeresComponent {
  @Input() showProds: Ropa[] = [];

  seleccion: string[] = [];
  cantidad: number = 0;
  productos: Ropa[] = [];
  isLoading: boolean = true; // bandera de carga

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.muestraMujer();
  }

  muestraMujer() {
    this.productosService.fnMujer().subscribe({
      next: datos => {
        console.log('PRODUCTOS RECIBIDOS:', datos); 
        this.showProds = datos;
        this.isLoading = false; // desactiva loading
      },
      error: err => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  agregarAlCarrito(producto: Ropa): void {
    if (!this.hasStock(producto)) {
      return;
    }

    this.carritoService.agregarProducto(producto._id, 1).subscribe({
      next: cart => {
        console.log('Producto agregado al carrito');
      },
      error: err => console.error('No se pudo agregar', err)
    });
  }

  hasStock(producto: Ropa): boolean {
    console.log('Stock del producto:', producto.name, producto.stock);
    const stock = Number(producto?.stock ?? 0);
    return stock > 0;
  }

  verDetalle(productoId: string): void {
    this.router.navigate(['/producto', productoId]);
  }

cargarProductos() {
  setTimeout(() => {
    this.productosService.fnMujer().subscribe((data) => {
      this.showProds = data;
      this.isLoading = false;
    });
  }, 5000);

}}
