import { computed, signal, type Signal, type WritableSignal } from '@angular/core';

export interface SliderConfig {
  /**
   * Posición inicial del slider (0–100).
   * @default 50
   */
  readonly initialPosition?: number;

  /**
   * Incremento por tecla de flecha.
   * @default 5
   */
  readonly step?: number;

  /**
   * Formatea el texto del anuncio accesible.
   * Recibe la posición actual (0–100) y debe devolver el texto.
   * Por defecto: "Before X%, After Y%".
   */
  readonly announce?: (position: number) => string;
}

/**
 * Controlador de slider puro, sin dependencias del DOM.
 *
 * Maneja posición, arrastre (pointer), teclado y anuncios accesibles
 * usando exclusivamente signals. El componente se encarga de pasarle
 * las coordenadas del DOM y los eventos de pointer.
 *
 * @example
 * ```typescript
 * readonly slider = new SliderController({ initialPosition: 50 });
 *
 * onPointerDown(event: PointerEvent): void {
 *   event.preventDefault();
 *   (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
 *   this.slider.startDrag(event);
 * }
 *
 * onPointerMove(event: PointerEvent): void {
 *   if (!this.slider.isDragging()) return;
 *   const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
 *   this.slider.updateDrag(event, rect.width);
 * }
 * ```
 */
export class SliderController {
  // ─── Estado ────────────────────────────────────────────

  /** Posición del slider en porcentaje (0–100). */
  readonly position: WritableSignal<number>;

  /** true durante el arrastre del slider. */
  readonly isDragging: WritableSignal<boolean> = signal(false);

  /** Anuncio para lectores de pantalla al soltar el slider o presionar teclas. */
  readonly announcement: WritableSignal<string> = signal('');

  /** Texto descriptivo formateado: "Before X%, After Y%". */
  readonly valueText: Signal<string> = computed(() => {
    const pos = this.position();
    if (this.#config.announce) {
      return this.#config.announce(pos);
    }
    const before = Math.round(pos);
    const after = 100 - before;
    return `Before ${before}%, After ${after}%`;
  });

  // ─── Internals ─────────────────────────────────────────

  readonly #config: SliderConfig;
  readonly #step: number;
  #startX = 0;
  #startPos = 0;

  constructor(config: SliderConfig = {}) {
    this.#config = config;
    this.#step = config.step ?? 5;
    this.position = signal(config.initialPosition ?? 50);
  }

  // ─── Pointer ───────────────────────────────────────────

  /**
   * Inicia el arrastre. Almacena la posición inicial y la coordenada X
   * del pointer para calcular el delta en `updateDrag`.
   */
  startDrag(event: PointerEvent): void {
    this.isDragging.set(true);
    this.#startX = event.clientX;
    this.#startPos = this.position();
  }

  /**
   * Actualiza la posición del slider basado en el movimiento del pointer.
   * @param containerWidth Ancho del contenedor en píxeles (de getBoundingClientRect).
   */
  updateDrag(event: PointerEvent, containerWidth: number): void {
    if (!this.isDragging()) return;
    const deltaX = event.clientX - this.#startX;
    const deltaPercent = (deltaX / containerWidth) * 100;
    const newPos = this.#startPos + deltaPercent;
    this.position.set(Math.max(0, Math.min(100, Math.round(newPos))));
  }

  /** Finaliza el arrastre y genera el anuncio accesible. */
  endDrag(): void {
    if (!this.isDragging()) return;
    this.isDragging.set(false);
    this.#announce();
  }

  // ─── Keyboard ──────────────────────────────────────────

  /**
   * Maneja teclas de slider: ← → Home End.
   *
   * Devuelve `true` si la tecla fue manejada (el componente no debe
   * procesarla), `false` si no es una tecla de slider.
   */
  onKeydown(event: KeyboardEvent): boolean {
    const { key } = event;

    switch (key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.position.update(v => Math.max(0, v - this.#step));
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.position.update(v => Math.min(100, v + this.#step));
        break;
      case 'Home':
        event.preventDefault();
        this.position.set(0);
        break;
      case 'End':
        event.preventDefault();
        this.position.set(100);
        break;
      default:
        return false; // no es una tecla de slider
    }

    event.stopPropagation();
    this.#announce();
    return true;
  }

  // ─── Reset ─────────────────────────────────────────────

  /** Resetea la posición del slider. Si no se pasa posición, usa la inicial. */
  reset(position?: number): void {
    this.position.set(position ?? this.#config.initialPosition ?? 50);
  }

  // ─── Private ───────────────────────────────────────────

  #announce(): void {
    this.announcement.set(this.valueText());
  }
}
