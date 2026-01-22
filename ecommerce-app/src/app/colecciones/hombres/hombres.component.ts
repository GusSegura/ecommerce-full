import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Ropa } from '../../core/types/ropa';
import { ProductosService } from '../../core/services/product/productos.service';
import { CarritoService } from '../../core/services/cart/carrito.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-hombres',
  standalone: true,
  imports: [],
  templateUrl: './hombres.component.html',
  styleUrl: './hombres.component.css'
})
export class HombresComponent {
  @Input() showProds:Ropa[]=[];

  seleccion:string[]=[];
  cantidad: number = 0;
  productos: Ropa[] = [];
  isLoading: boolean = true;

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(){
    this.muestraHombre();
}
muestraHombre() {
  this.productosService.fnHombre().subscribe({
    next: datos => {
      console.log('PRODUCTOS RECIBIDOS:', datos); 
      this.showProds = datos;

      // 🔑 Ocultar spinner y mostrar productos
      this.isLoading = false;
    },
    error: err => {
      console.error(err);
      // En caso de error también ocultamos el spinner
      this.isLoading = false;
    }
  });}

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


}
