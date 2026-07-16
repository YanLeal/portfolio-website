import { Component, input } from '@angular/core';
import { CarouselController } from '../../utils/carousel-controller';

@Component({
  selector: 'app-carousel',
  standalone: true,
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
})
/**
 * Carrusel accesible con navegación por dots, botones prev/next,
 * y delegación de control a CarouselController.
 *
 * Las slides se proyectan con `<ng-content>`. El controlador externo
 * maneja el estado (índice actual, auto-play, dirección) y se pasa
 * como input para que el padre retenga la lógica de navegación.
 *
 * Soporta handlers personalizados para dot/prev/next mediante inputs
 * callback, permitiendo override del comportamiento default.
 *
 * @usage
 * ```html
 * <app-carousel
 *   [controller]="myController"
 *   [totalItems]="items().length"
 *   ariaLabel="Testimonios"
 *   itemLabelSingular="testimonio">
 *   @for (item of items(); track item.id) {
 *     <div class="slide">{{ item.content }}</div>
 *   }
 * </app-carousel>
 * ```
 */
export class CarouselComponent {
  // ─── Required ────────────────────────────────────────────

  /** Controlador del carrusel (maneja estado, navegación, auto-play). */
  readonly controller = input.required<CarouselController>();

  /** Cantidad total de slides (para renderizar dots). */
  readonly totalItems = input.required<number>();

  // ─── ARIA / Labels ──────────────────────────────────────

  /** Label ARIA para el carrusel (region). */
  readonly ariaLabel = input<string>('Carrusel');

  /** Sustantivo singular para aria-label de cada dot.
   *  Ej: 'testimonio' → "Ir al testimonio 1", "Ir al testimonio 2" */
  readonly itemLabelSingular = input<string>('slide');

  // ─── Visual / Behavior ──────────────────────────────────

  /** Oculta los botones de navegación cuando estamos al inicio/fin. */
  readonly hideNavOnBounds = input(true);

  /** Desactiva la transición del track (para saltos no adyacentes). */
  readonly animateTrack = input<boolean>(true);

  /** Oculta navegación cuando el zoom está activo. */
  readonly zoomActive = input(false);

  // ─── Custom handlers (override default behavior) ───────

  /** Handler personalizado para click en dot. Recibe el índice. */
  readonly onDotClick = input<((index: number) => void) | undefined>();

  /** Handler personalizado para botón anterior. */
  readonly onNavPrev = input<((() => void) | undefined)>();

  /** Handler personalizado para botón siguiente. */
  readonly onNavNext = input<((() => void) | undefined)>();

  // ─── Helpers ────────────────────────────────────────────

  /** Crea un array de índices para iterar los dots en el template. */
  makeIndexArray(length: number): number[] {
    return Array.from({ length }, (_, i) => i);
  }

  // ─── Handlers ───────────────────────────────────────────

  handleDotClick(index: number): void {
    const handler = this.onDotClick();
    if (handler) {
      handler(index);
    } else {
      this.controller().goTo(index);
    }
  }

  handlePrev(): void {
    const handler = this.onNavPrev();
    if (handler) {
      handler();
    } else {
      this.controller().previous();
    }
  }

  handleNext(): void {
    const handler = this.onNavNext();
    if (handler) {
      handler();
    } else {
      this.controller().next();
    }
  }

}
