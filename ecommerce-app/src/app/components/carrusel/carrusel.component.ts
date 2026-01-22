import { AfterViewInit, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.css']
})
export class CarruselComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    const el = document.querySelector('#carouselExampleSlidesOnly');
    if (el) {
      new bootstrap.Carousel(el, {
        interval: 4000,
        ride: 'carousel',
        pause: false
      });
    }
  }
}