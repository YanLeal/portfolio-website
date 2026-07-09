import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { GalleryGrid, GalleryImage } from '../../shared/components/gallery-grid/gallery-grid';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [SectionHeader, GalleryGrid],
  host: { class: 'section-padding' },
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class GalleryComponent {
  readonly images: GalleryImage[] = [
    {
      src: 'images/gallery/resultado-corte-de-cabello.webp',
      alt: 'Resultado de corte de cabello',
    },
    {
      src: 'images/gallery/resultado-coloracion.webp',
      alt: 'Resultado de coloración',
    },
    {
      src: 'images/gallery/detalle-de-nail-art-creativo.webp',
      alt: 'Detalle de nail art creativo',
    },
    {
      src: 'images/gallery/maquillaje-finalizado.webp',
      alt: 'Maquillaje finalizado',
    },
    {
      src: 'images/gallery/resultado-manicuria.webp',
      alt: 'Resultado de manicuría',
    },
    {
      src: 'images/gallery/momento-de-cuidado.webp',
      alt: 'Momento de cuidado y relax',
    },
    {
      src: 'images/gallery/equipo-trabajando.webp',
      alt: 'Nuestro equipo trabajando',
    },
    {
      src: 'images/gallery/transformacion-antes-despues.webp',
      alt: 'Transformación antes y después',
    },
  ];
}
