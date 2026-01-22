import { Component } from '@angular/core';
import { CarruselComponent } from "../components/carrusel/carrusel.component";
import { NosotrosComponent } from "../components/nosotros/nosotros.component";
import { TemporadasComponent } from "../components/temporadas/temporadas.component";
import { OfertasComponent } from "../components/ofertas/ofertas.component";


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CarruselComponent, NosotrosComponent, TemporadasComponent, OfertasComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
