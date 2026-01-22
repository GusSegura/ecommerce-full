import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductosService } from '../../core/services/product/productos.service';
import { CarritoService } from '../../core/services/cart/carrito.service';
import { Ropa } from '../../core/types/ropa';

@Component({
  selector: 'app-reporte-temporada',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reporte-temporada.component.html',
  styleUrl: './reporte-temporada.component.css'
})
export class ReporteTemporadaComponent implements OnInit {

  productosTemporada: Ropa[] = [];
  temporada: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
    private carritoService: CarritoService
  ) {}

  normalizeString(s: string): string {
  return s
    .normalize('NFD')                     // separa letras + diacríticos
    .replace(/\p{Diacritic}/gu, '')       // elimina diacríticos (ñ -> n? no, ñ se mantiene como n? cuidado)
    .replace(/ñ/gi, 'n')                  // si prefieres tratar ñ como n, opcional
    .toLowerCase()
    .trim();
}

  ngOnInit(): void {
  this.route.paramMap.subscribe(params => {
    this.temporada = params.get('temporada') || '';

    this.productosService.getRopa().subscribe(response => {
      const busc = this.normalizeString(this.temporada);

      this.productosTemporada = (response.products || []).filter((p: any) => {
        const rawSeason = (p.season ?? '') as string;
        const pTemp = this.normalizeString(rawSeason);
        return pTemp !== '' && pTemp === busc;
      });
    });

  });
}



  agregarAlCarrito(producto: Ropa) {
    this.carritoService.agregarProducto(producto._id, 1)
  }

  navegar(temporada: string) {
    this.router.navigate(['/reporte-temporada', temporada]);
  }
}
