import { Component, input, output } from '@angular/core';

export interface GalleryImage {
  /** Ruta de la imagen. */
  readonly src: string;
  /** Texto alternativo para accesibilidad. */
  readonly alt: string;
  /**
   * Texto opcional para el figcaption (visible).
   * Si no se provee, se usa `alt` como fallback.
   * Si no querés caption, omití ambos o pasá caption="" explícitamente.
   */
  readonly caption?: string;
}

@Component({
  selector: 'app-gallery-grid',
  standalone: true,
  templateUrl: './gallery-grid.html',
  styleUrl: './gallery-grid.css',
  host: {
    '[style.--gallery-columns]': 'columns()',
    '[class.is-animated]': 'animate()',
  },
})
/**
 * Grid de imágenes con layout masonry responsive.
 *
 * Por defecto se adapta en 2→3→4 columnas según el viewport.
 * Se puede forzar un número fijo de columnas con el input `columns`.
 * La animación de entrada se puede desactivar con `[animate]="false"`.
 * Emite `imageClicked` con la imagen clickeada para interacción opcional
 * (lightbox, modal, navegación, etc.).
 *
 * @usage
 * ```html
 * <app-gallery-grid [images]="galleryImages" (imageClicked)="openLightbox($event)" />
 * <app-gallery-grid [images]="images" [columns]="3" [animate]="false" />
 * ```
 */
export class GalleryGrid {
  /** Array de imágenes a mostrar. */
  readonly images = input.required<GalleryImage[]>();

  /**
   * Fuerza un número fijo de columnas en todos los breakpoints.
   * Si no se setea, usa el responsive default: 2→3→4.
   */
  readonly columns = input<number | undefined>(undefined);

  /** Animación de entrada escalonada. Desactivar con `false`. */
  readonly animate = input(true);

  /** Emite la imagen al hacer click (teclado incluido). */
  readonly imageClicked = output<GalleryImage>();
}
