import { Directive, HostListener, output } from '@angular/core';

/**
 * Directiva standalone para detectar gestos de swipe horizontal.
 *
 * Escucha pointerdown/pointerup en el host, calcula velocidad y distancia,
 * y emite la dirección del swipe: `1` (siguiente, izquierda) o `-1` (anterior, derecha).
 *
 * @usage
 * ```html
 * <div appSwipe (swipe)="onSwipe($event)">
 *   ...
 * </div>
 * ```
 */
@Directive({
  selector: '[appSwipe]',
  standalone: true,
})
export class SwipeDirective {
  /** 1 = swipe a la izquierda (siguiente), -1 = swipe a la derecha (anterior). */
  readonly swipe = output<1 | -1>();

  readonly #minDistance = 60;
  readonly #maxDuration = 300;
  #startX = 0;
  #startTime = 0;

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    this.#startX = event.clientX;
    this.#startTime = performance.now();
  }

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    const elapsed = performance.now() - this.#startTime;
    const deltaX = event.clientX - this.#startX;

    if (elapsed < this.#maxDuration && Math.abs(deltaX) > this.#minDistance) {
      this.swipe.emit(deltaX > 0 ? -1 : 1);
    }
  }
}
