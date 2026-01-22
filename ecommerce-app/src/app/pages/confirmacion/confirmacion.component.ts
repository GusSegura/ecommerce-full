import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.css'
})
export class ConfirmacionComponent implements OnInit {

  pedidoId: string = '';
  pedido: any = null;

  ngOnInit() {
    const data = localStorage.getItem('pedido');

    if (data) {
      this.pedido = JSON.parse(data);

      // ID de pedido generado
      this.pedidoId = Math.random().toString(36).substring(2, 9).toUpperCase();
    }
  }
}