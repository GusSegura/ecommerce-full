import { Component, Input } from '@angular/core';
import { Ropa } from '../../core/types/ropa';
import { Router } from '@angular/router';
import { ProductosService } from '../../core/services/product/productos.service';
import { CarritoService } from '../../core/services/cart/carrito.service';
import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-accesorios',
  standalone: true,
  imports: [],
  templateUrl: './accesorios.component.html',
  styleUrl: './accesorios.component.css'
})
export class AccesoriosComponent {
  @Input() showProds:Ropa[]=[];

  seleccion:string[]=[];
  cantidad: number =0;
  productos: Ropa[] = [];

  constructor(
    private productosService: ProductosService,
    private carritoService: CarritoService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(){
    this.muestraAccesorios();
}
muestraAccesorios(){
this.productosService.fnAccesorios().subscribe({
      next: datos => this.showProds = datos,
    error: err => console.error(err)
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


}
