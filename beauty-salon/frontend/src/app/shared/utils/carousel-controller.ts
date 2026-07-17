import { computed, DestroyRef, signal, type Signal, type WritableSignal } from '@angular/core';

export interface CarouselConfig {
  /** Señal reactiva con la cantidad total de ítems. */
  readonly totalItems: Signal<number>;

  /** Intervalo de auto-play en ms. 0 o undefined = sin auto-play. */
  readonly autoPlayInterval?: number;

  /** Referencia para cleanup del timer al destruir el componente. */
  readonly destroyRef: DestroyRef;

  /**
   * Si `false`, next/previous se frenan en los extremos en lugar de wrappear.
   * @default true
   */
  readonly loop?: boolean;
}

const DEFAULT_LOOP = true;

/**
 * Controlador de carrusel reutilizable.
 *
 * Maneja el estado de navegación, auto-play, loop y swipe.
 * No tiene dependencias de DOM ni de Angular CDK — funciona con signals puras.
 *
 * @example
 * ```typescript
 * readonly carousel = new CarouselController({
 *   totalItems: computed(() => this.items().length),
 *   autoPlayInterval: 6000,
 *   destroyRef: inject(DestroyRef),
 * });
 * ```
 */
export class CarouselController {
  // ─── Estado ────────────────────────────────────────────

  /** Índice del slide visible actualmente. 0 = primero. */
  readonly currentIndex: WritableSignal<number> = signal(0);

  /** true cuando el auto-play está pausado por hover/foco. */
  readonly isPaused: WritableSignal<boolean> = signal(false);

  /** Dirección del último movimiento (1 = next, -1 = prev).
   *  Sirve para animaciones direccionales. */
  readonly direction: WritableSignal<1 | -1> = signal(1);

  // ─── Computeds ─────────────────────────────────────────

  /** Valor CSS `transform` para el track del carrusel. */
  readonly translateX: Signal<string> = computed(() =>
    `translateX(-${this.currentIndex() * 100}%)`,
  );

  /** true si estamos en el primer slide. */
  readonly isFirst: Signal<boolean> = computed(() =>
    this.currentIndex() === 0,
  );

  /** true si estamos en el último slide. */
  readonly isLast: Signal<boolean> = computed(() =>
    this.currentIndex() === this.#config.totalItems() - 1,
  );

  // ─── Internals ─────────────────────────────────────────

  readonly #config: CarouselConfig;
  #autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: CarouselConfig) {
    this.#config = config;
    config.destroyRef.onDestroy(() => this.#clearTimer());

    if (config.autoPlayInterval && config.autoPlayInterval > 0) {
      this.#startAutoPlay(config.autoPlayInterval);
    }
  }

  // ─── Navegación manual ─────────────────────────────────

  /** Avanza al siguiente slide. Con loop=true wrappea al primero si está al final. */
  readonly next = (): void => {
    this.direction.set(1);
    if (this.isLast()) {
      if (this.#config.loop ?? DEFAULT_LOOP) {
        this.currentIndex.set(0);
      }
      // loop=false: no hace nada, ya estamos al final
    } else {
      this.currentIndex.update(i => i + 1);
    }
    this.#resetAutoPlay();
  };

  /** Retrocede al slide anterior. Con loop=true wrappea al último si está al inicio. */
  readonly previous = (): void => {
    this.direction.set(-1);
    if (this.isFirst()) {
      if (this.#config.loop ?? DEFAULT_LOOP) {
        this.currentIndex.set(this.#config.totalItems() - 1);
      }
      // loop=false: no hace nada, ya estamos al inicio
    } else {
      this.currentIndex.update(i => i - 1);
    }
    this.#resetAutoPlay();
  };

  /** Salta al slide en el índice dado. */
  readonly goTo = (index: number): void => {
    const clamped = Math.max(0, Math.min(index, this.#config.totalItems() - 1));
    this.direction.set(clamped > this.currentIndex() ? 1 : -1);
    this.currentIndex.set(clamped);
    this.#resetAutoPlay();
  };

  // ─── Swipe ─────────────────────────────────────────────

  /** Navega según la dirección del swipe: 1 = siguiente, -1 = anterior. */
  readonly handleSwipe = (direction: 1 | -1): void => {
    if (direction > 0) this.next();
    else this.previous();
  };

  // ─── Eventos de teclado ────────────────────────────────

  /** Maneja teclas de navegación: ← → Home End. */
  readonly onKeydown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.previous();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.next();
        break;
      case 'Home':
        event.preventDefault();
        this.goTo(0);
        break;
      case 'End':
        event.preventDefault();
        this.goTo(this.#config.totalItems() - 1);
        break;
    }
  };

  // ─── Auto-play ─────────────────────────────────────────

  /** Pausa el auto-play (mouseenter, focusin). */
  readonly pause = (): void => {
    this.isPaused.set(true);
    this.#clearTimer();
  };

  /** Reanuda el auto-play (mouseleave, focusout). */
  readonly resume = (): void => {
    this.isPaused.set(false);
    if (this.#config.autoPlayInterval && this.#config.autoPlayInterval > 0) {
      this.#startAutoPlay(this.#config.autoPlayInterval);
    }
  };

  // ─── Privados ──────────────────────────────────────────

  /** Reinicia el auto-play si está activo (post navegación manual). */
  #resetAutoPlay(): void {
    const interval = this.#config.autoPlayInterval;
    if (interval && interval > 0 && !this.isPaused()) {
      this.#startAutoPlay(interval);
    }
  }

  #startAutoPlay(intervalMs: number): void {
    this.#clearTimer();
    this.#autoPlayTimer = setInterval(() => {
      if (this.isLast()) {
        if (this.#config.loop ?? DEFAULT_LOOP) {
          this.currentIndex.set(0);
        }
        // loop=false: el timer no avanza más, se queda en el último
      } else {
        this.currentIndex.update(i => i + 1);
      }
    }, intervalMs);
  }

  #clearTimer(): void {
    if (this.#autoPlayTimer !== null) {
      clearInterval(this.#autoPlayTimer);
      this.#autoPlayTimer = null;
    }
  }
}
