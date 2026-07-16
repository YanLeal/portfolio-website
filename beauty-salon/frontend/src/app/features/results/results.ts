import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CarouselController,
  Carousel,
  ErrorBoundary,
  ImageCompare,
  SectionHeader,
} from '../../shared';
import { ResultService } from '../../domains/results/result.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [Carousel, ErrorBoundary, SectionHeader, ImageCompare],
  templateUrl: './results.html',
  styleUrl: './results.css',
})
export class ResultsComponent {
  private readonly resultService = inject(ResultService);
  private readonly destroyRef = inject(DestroyRef);
  readonly results = toSignal(this.resultService.getAll(), { initialValue: [] });
  readonly hasError = this.resultService.error;

  /** Resultado activo según el índice del carrusel. */
  readonly currentResult = computed(() =>
    this.results()[this.carousel.currentIndex()],
  );

  /** Carrusel reutilizable. */
  readonly carousel = new CarouselController({
    totalItems: computed(() => this.results().length),
    autoPlayInterval: 6000,
    destroyRef: this.destroyRef,
  });

  /**
   * Controla si el track del carrusel anima el transform.
   * Se desactiva temporalmente en saltos no adyacentes (dot click)
   * para evitar que los slides intermedios parpadeen al cruzar.
   */
  readonly animateTrack = signal(true);

  /**
   * Conjunto de índices que cargan eager: slide activo + adyacentes.
   * El resto carga lazy. Se recalcula automáticamente al navegar.
   */
  readonly eagerIndices = computed(() => {
    const current = this.carousel.currentIndex();
    const total = this.results().length;
    const indices = new Set<number>();
    indices.add(current);
    if (current > 0) indices.add(current - 1);
    if (current < total - 1) indices.add(current + 1);
    return indices;
  });

  /** true mientras el zoom está activo (native fullscreen o fallback CSS). */
  readonly isZoomActive = signal(false);

  /**
   * Desactiva temporalmente la transición del track para saltos
   * no adyacentes, evitando parpadeo de slides intermedios.
   * Se reactiva en el siguiente frame.
   */
  readonly #jumpTo = (index: number): void => {
    const current = this.carousel.currentIndex();
    const isAdjacent = Math.abs(index - current) <= 1;

    if (!isAdjacent) {
      this.animateTrack.set(false);
    }

    this.carousel.goTo(index);

    if (!isAdjacent) {
      requestAnimationFrame(() => this.animateTrack.set(true));
    }
  };

  /** Navegación por dots. */
  readonly onDotClick = (index: number): void => this.#jumpTo(index);

  /**
   * Keydown de la sección. Home/End hacen saltos no adyacentes;
   * el resto lo maneja el carrusel (ArrowLeft/Right).
   * Las teclas del slider se manejan dentro de <app-image-compare>
   * y no propagan al section.
   */
  readonly onSectionKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const target = event.key === 'Home' ? 0 : this.results().length - 1;
      this.#jumpTo(target);
    } else {
      this.carousel.onKeydown(event);
    }
  };

  /** Navega el carrusel cuando el usuario swipa sobre el comparador. */
  readonly onSwipe = (direction: 1 | -1): void => {
    if (direction > 0) {
      this.carousel.next();
    } else {
      this.carousel.previous();
    }
  };

  /** Sincroniza el estado del zoom para ocultar/mostrar navegación. */
  readonly onZoomChange = (zoomed: boolean): void => {
    this.isZoomActive.set(zoomed);
  };
}
