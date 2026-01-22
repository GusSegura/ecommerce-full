import { Component, AfterViewInit } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-nosotros',
  templateUrl: './nosotros.component.html',
  styleUrls: ['./nosotros.component.css']
})
export class NosotrosComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    // Esperamos un poco para asegurarnos de que el DOM esté listo
    setTimeout(() => {
      const el = document.querySelector('#carouselExampleSlidesOnly');
      console.log('Inicializando carrusel de Nosotros');
      if (el) {
        new bootstrap.Carousel(el, {
          interval: 2000,
          ride: 'carousel',
          pause: false,
          wrap: true
        });
      }
    }, 100); // 100ms suele ser suficiente
  }
}
