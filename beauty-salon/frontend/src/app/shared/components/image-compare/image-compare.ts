import { Component, computed, DestroyRef, effect, ElementRef, inject, input, output, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-image-compare',
  standalone: true,
  templateUrl: './image-compare.html',
  styleUrl: './image-compare.css',
})
export class ImageCompare {
  // ─── Inputs ──────────────────────────────────────────────

  /** URL de la imagen "antes". */
  readonly beforeImage = input.required<string>();

  /** URL de la imagen "después". */
  readonly afterImage = input.required<string>();

  /**
   * Texto alternativo base. Se combina con "Antes: " / "Después: "
   * para cada imagen, y con "Comparación antes y después: " para
   * el aria-label del slider.
   */
  readonly alt = input<string>('');

  /** Posición inicial del slider (0–100). 50 = mitad y mitad. */
  readonly initialPosition = input(50);

  /** Relación de aspecto del contenedor (CSS aspect-ratio). */
  readonly aspectRatio = input('1 / 1');

  /** Ancho máximo del contenedor. */
  readonly maxWidth = input('36rem');

  /** Estrategia de carga de imágenes. */
  readonly loadingStrategy = input<'lazy' | 'eager'>('lazy');

  /**
   * Indica si este es el comparador activo (slide actual del carrusel).
   * Controla visibilidad del botón fullscreen y animaciones de zoom.
   */
  readonly active = input(false);

  /**
   * Clave que al cambiar resetea el slider a la posición inicial.
   * Útil cuando el carrusel navega y se quiere reiniciar el slider.
   */
  readonly resetKey = input(0);

  // ─── Outputs ─────────────────────────────────────────────

  /** Se emite cuando el usuario desliza rápido (swipe). 1 = siguiente, -1 = anterior. */
  readonly swipe = output<1 | -1>();

  /** Se emite al abrir o cerrar la vista ampliada (zoom). */
  readonly zoomChange = output<boolean>();

  /** Se emite cuando la posición del slider cambia por interacción. */
  readonly positionChange = output<number>();

  // ─── Estado interno ──────────────────────────────────────

  /** Posición del divisor en porcentaje (0–100). */
  readonly sliderPosition = signal(this.initialPosition());

  /** true durante el arrastre del slider. */
  readonly isDragging = signal(false);

  /** true cuando la vista ampliada está activa. */
  readonly isZoomed = signal(false);

  /** true cuando el zoom usa la Fullscreen API del navegador. */
  readonly usingFullscreen = signal(false);

  /** true durante la animación de salida del zoom (fallback CSS). */
  readonly isLeaving = signal(false);

  /** Anuncio para lectores de pantalla al soltar el slider o presionar teclas. */
  readonly sliderAnnouncement = signal('');

  /** Texto descriptivo: "Antes X%, Después Y%". */
  readonly sliderValueText = computed(() => {
    const before = Math.round(this.sliderPosition());
    const after = 100 - before;
    return `Antes ${before}%, Después ${after}%`;
  });

  /** aria-label del slider. */
  readonly sliderLabel = computed(() => {
    const base = 'Comparación antes y después';
    return this.alt() ? `${base}: ${this.alt()}` : base;
  });

  // ─── Referencias al DOM ──────────────────────────────────

  private readonly containerEl = viewChild.required<ElementRef<HTMLElement>>('container');

  // ─── Zoom ────────────────────────────────────────────────

  readonly #enterZoom = (): void => {
    if (document.fullscreenEnabled) {
      const el = this.containerEl().nativeElement;
      if (el.requestFullscreen) {
        this.isZoomed.set(true); // optimista — fullscreenchange lo confirma
        el.requestFullscreen().catch(() => {
          // Usuario denegó o error silencioso → fullscreenchange no dispara,
          // isZoomed se queda en true (fallback CSS)
        });
        return;
      }
    }
    // Fallback: CSS overlay
    this.isZoomed.set(true);
  };

  readonly #exitZoom = (): void => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    this.isZoomed.set(false);
  };

  readonly toggleZoom = (): void => {
    if (this.isZoomed()) {
      this.#exitZoom();
    } else {
      this.#enterZoom();
    }
    this.zoomChange.emit(this.isZoomed());
  };

  readonly closeZoom = (): void => {
    if (!this.isZoomed()) return;

    if (!this.usingFullscreen() && !document.fullscreenElement) {
      // CSS fallback: animar salida primero, restaurar foco al terminar
      this.isLeaving.set(true);
      this.#exitZoom();
      setTimeout(() => {
        this.isLeaving.set(false);
        this.#restoreFocus();
        this.zoomChange.emit(false);
      }, 250);
    } else {
      this.#exitZoom();
      this.zoomChange.emit(false);
    }
  };

  readonly onCloseKeydown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') return;
    event.stopPropagation();
  };

  readonly #restoreFocus = (): void => {
    this.containerEl()?.nativeElement.focus();
  };

  // ─── Swipe detection ─────────────────────────────────────

  readonly #swipeMinDistance = 60;
  readonly #swipeMaxDuration = 300;
  #swipeStartX = 0;
  #swipeStartTime = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Resetear slider al cambiar resetKey (navegación del carrusel)
    effect(() => {
      this.resetKey();
      this.sliderPosition.set(this.initialPosition());
    });

    // Salir del zoom si el componente deja de ser activo
    effect(() => {
      if (!this.active() && this.isZoomed()) {
        this.#exitZoom();
      }
    });

    // Sincronizar estado con Fullscreen API
    const onFsChange = (): void => {
      const isFs = !!document.fullscreenElement;
      this.usingFullscreen.set(isFs);
      this.isZoomed.set(isFs || this.isZoomed());
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange' as 'fullscreenchange', onFsChange);
    destroyRef.onDestroy(() => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange' as 'fullscreenchange', onFsChange);
    });

    // Escape + body scroll lock para fallback CSS
    effect((onCleanup) => {
      if (this.isZoomed() && !this.usingFullscreen()) {
        document.body.style.overflow = 'hidden';
        const handler = (e: KeyboardEvent) => {
          if (e.key === 'Escape') this.closeZoom();
        };
        document.addEventListener('keydown', handler);
        onCleanup(() => {
          document.body.style.overflow = '';
          document.removeEventListener('keydown', handler);
        });
      }
    });
  }

  // ─── Teclado ─────────────────────────────────────────────

  readonly onKeydown = (event: KeyboardEvent): void => {
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
      case 'Enter':
      case ' ':
        event.preventDefault();
        event.stopPropagation();
        this.toggleZoom();
        return; // no anunciar — el zoom no cambia la posición
      default:
        return; // no detener propagación para otras teclas
    }
    event.stopPropagation();
    this.sliderAnnouncement.set(this.sliderValueText());
    this.positionChange.emit(this.sliderPosition());
  };

  // ─── Pointer ─────────────────────────────────────────────

  readonly onPointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    this.isDragging.set(true);
    this.#swipeStartX = event.clientX;
    this.#swipeStartTime = performance.now();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.#updatePosition(event);
  };

  readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.isDragging()) return;
    event.preventDefault();
    this.#updatePosition(event);
  };

  readonly onPointerUp = (event: PointerEvent): void => {
    this.isDragging.set(false);

    const elapsed = performance.now() - this.#swipeStartTime;
    const deltaX = event.clientX - this.#swipeStartX;

    if (elapsed < this.#swipeMaxDuration && Math.abs(deltaX) > this.#swipeMinDistance) {
      // Swipe detectado → salir de zoom si está activo, emitir dirección
      if (this.isZoomed()) {
        this.#exitZoom();
        this.zoomChange.emit(false);
      }
      this.swipe.emit(deltaX > 0 ? -1 : 1);
      this.sliderAnnouncement.set(this.sliderValueText());
      return;
    }

    // Si no fue swipe, anunciar la posición final
    this.sliderAnnouncement.set(this.sliderValueText());
    this.positionChange.emit(this.sliderPosition());
  };

  #updatePosition(event: PointerEvent): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    this.sliderPosition.set((x / rect.width) * 100);
  }
}
