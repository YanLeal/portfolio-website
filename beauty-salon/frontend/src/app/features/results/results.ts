import { Component, computed, DestroyRef, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CarouselController } from '../../shared/utils/carousel-controller';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { ResultService } from '../../domains/results/result.service';

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [SectionHeader],
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

  // ─── Slider before / after ───────────────────────────

  /** Posición del divisor en porcentaje (0-100). 50 = mitad y mitad. */
  readonly sliderPosition = signal(50);

  /** true mientras el usuario arrastra el slider. */
  readonly isDragging = signal(false);

  /** Texto descriptivo para aria-valuetext: "Antes 30%, Después 70%" */
  readonly sliderValueText = computed(() => {
    const before = Math.round(this.sliderPosition());
    const after = 100 - before;
    return `Antes ${before}%, Después ${after}%`;
  });

  /**
   * Anuncio para aria-live — se actualiza solo al soltar el slider
   * (pointerup) o al presionar teclas, para evitar spam de lectores
   * de pantalla durante el arrastre continuo.
   */
  readonly sliderAnnouncement = signal('');

  // ─── Swipe detection ───────────────────────────────────

  /** Mínima distancia horizontal (px) para considerar un swipe. */
  readonly #swipeMinDistance = 60;

  /** Máxima duración (ms) para considerar un swipe (vs. arrastre lento). */
  readonly #swipeMaxDuration = 300;

  #swipeStartX = 0;
  #swipeStartTime = 0;

  constructor() {
    // Resetear slider al cambiar de slide
    effect(() => {
      this.carousel.currentIndex();
      this.sliderPosition.set(50);
    });
  }

  /** Control del slider con teclado. Previene propagación para no navegar el carrusel. */
  readonly onSliderKeydown = (event: KeyboardEvent): void => {
    const step = 5;
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.sliderPosition.update(v => Math.max(0, v - step));
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.sliderPosition.update(v => Math.min(100, v + step));
        break;
      case 'Home':
        event.preventDefault();
        this.sliderPosition.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.sliderPosition.set(100);
        break;
      default:
        return; // no detener propagación para otras teclas
    }
    event.stopPropagation();
    this.sliderAnnouncement.set(this.sliderValueText());
  };

  /** Inicia el arrastre. Captura el puntero, previene scroll y registra inicio para swipe detection. */
  readonly onPointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.isDragging.set(true);
    this.#swipeStartX = event.clientX;
    this.#swipeStartTime = performance.now();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.#updatePosition(event);
  };

  /** Actualiza la posición mientras se arrastra. */
  readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging()) return;
    event.preventDefault();
    this.#updatePosition(event);
  };

  /** Finaliza el arrastre. Si fue un swipe rápido → navega. */
  readonly onPointerUp = (event: PointerEvent): void => {
    this.isDragging.set(false);

    const elapsed = performance.now() - this.#swipeStartTime;
    const deltaX = event.clientX - this.#swipeStartX;

    if (elapsed < this.#swipeMaxDuration && Math.abs(deltaX) > this.#swipeMinDistance) {
      // Swipe detectado → navegar (el effect resetea sliderPosition a 50)
      if (deltaX > 0) {
        this.carousel.previous();
      } else {
        this.carousel.next();
      }
      this.sliderAnnouncement.set(this.sliderValueText());
      return;
    }

    // Si no fue swipe, anunciar la posición final al SR
    this.sliderAnnouncement.set(this.sliderValueText());
  };

  /** Calcula la posición del slider según coordenada X del puntero. */
  #updatePosition(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    this.sliderPosition.set((x / rect.width) * 100);
  }
}
