import { Component, input } from '@angular/core';

export interface GalleryImage {
  readonly src: string;
  readonly alt: string;
}

@Component({
  selector: 'app-gallery-grid',
  standalone: true,
  templateUrl: './gallery-grid.html',
  styleUrl: './gallery-grid.css',
})
/**
 * Grid de imágenes de galería con layout responsive.
 *
 * Renderiza un conjunto de `<figure>` con `<img>` y `<figcaption>`.
 * Las imágenes se distribuyen en columnas adaptativas según el
 * ancho de la pantalla.
 *
 * @usage
 * ```html
 * <app-gallery-grid [images]="galleryImages" />
 * ```
 */
export class GalleryGrid {
  readonly images = input.required<GalleryImage[]>();
}
