import { Component, computed, DestroyRef, effect, ElementRef, inject, input, output, signal, viewChild, type Signal } from '@angular/core';
import { SwipeDirective } from '../../directives/swipe.directive';
import { SliderController } from '../../utils';

// ─── Tipos de configuración ───────────────────────────────────────────────

/** Configuración del lado "antes" (before). */
export interface ImageCompareBefore {
  /** URL de la imagen (requerido). */
  readonly image: string;
  /** Label visual para esta imagen. Default: "Antes". */
  readonly label?: string;
  /** Alt text específico. Si no se especifica, usa el alt compartido. */
  readonly alt?: string;
}

/** Configuración del lado "después" (after). */
export interface ImageCompareAfter {
  /** URL de la imagen (requerido). */
  readonly image: string;
  /** Label visual para esta imagen. Default: "Después". */
  readonly label?: string;
  /** Alt text específico. Si no se especifica, usa el alt compartido. */
  readonly alt?: string;
}

/** Configuración de orientación / layout del contenedor. */
export interface ImageCompareOrientation {
  /** CSS aspect-ratio. Default: "1 / 1". */
  readonly aspectRatio?: string;
  /** Ancho máximo del contenedor. Default: "36rem". */
  readonly maxWidth?: string;
}

/** Textos configurables del componente. */
export interface ImageCompareLabels {
  /** Aria-label base del slider. Default: "Comparación antes y después". */
  readonly comparison?: string;
  /** Aria-label del botón fullscreen. Default: "Ver en pantalla completa". */
  readonly fullscreen?: string;
  /** Aria-label del botón cerrar zoom. Default: "Cerrar vista ampliada". */
  readonly close?: string;
}

/** Configuración de zoom. */
export interface ImageCompareZoom {
  /** Habilita la funcionalidad de zoom. Default: true. */
  readonly enabled?: boolean;
}

// ─── Valores por defecto ──────────────────────────────────────────────────

const DEFAULTS = {
  beforeLabel: 'Antes',
  afterLabel: 'Después',
  comparisonLabel: 'Comparación antes y después',
  fullscreenLabel: 'Ver en pantalla completa',
  closeLabel: 'Cerrar vista ampliada',
  aspectRatio: '1 / 1',
  maxWidth: '36rem',
  initialPosition: 50,
  zoomEnabled: true,
} as const;

@Component({
  selector: 'app-image-compare',
  standalone: true,
  imports: [SwipeDirective],
  templateUrl: './image-compare.html',
  styleUrl: './image-compare.css',
})
/**
 * Comparador visual "antes / después" con slider interactivo.
 *
 * Todos los textos son configurables mediante inputs agrupados,
 * lo que hace al componente 100% portable entre proyectos e idiomas.
 *
 * @usage
 * ```html
 * <app-image-compare
 *   [before]="{ image: result.before, label: 'Antes', alt: result.title }"
 *   [after]="{ image: result.after, label: 'Después' }"
 *   [labels]="{ comparison: 'Comparación antes y después' }"
 *   [zoom]="{ enabled: true }"
 *   [active]="isActive"
 *   (swipe)="onSwipe($event)"
 * />
 * ```
 */
export class ImageCompare {
  // ══════════════════════════════════════════════════════════════════════════
  // Inputs agrupados
  // ══════════════════════════════════════════════════════════════════════════

  /** Configuración del lado "antes". */
  readonly before = input.required<ImageCompareBefore>();

  /** Configuración del lado "después". */
  readonly after = input.required<ImageCompareAfter>();

  /** Configuración de orientación / layout. */
  readonly orientation = input<ImageCompareOrientation>({});

  /** Textos configurables. */
  readonly labels = input<ImageCompareLabels>({});

  /** Configuración de zoom. */
  readonly zoom = input<ImageCompareZoom>({});

  // ══════════════════════════════════════════════════════════════════════════
  // Inputs planos (comportamiento)
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Texto alternativo compartido para ambas imágenes.
   * Se usa como fallback cuando `before.alt` / `after.alt` no están definidos.
   */
  readonly alt = input<string>('');

  /** Posición inicial del slider (0–100). 50 = mitad y mitad. */
  readonly initialPosition = input(DEFAULTS.initialPosition);

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

  // ══════════════════════════════════════════════════════════════════════════
  // Outputs
  // ══════════════════════════════════════════════════════════════════════════

  /** Se emite cuando el usuario desliza rápido (swipe). 1 = siguiente, -1 = anterior. */
  readonly swipe = output<1 | -1>();

  /** Se emite al abrir o cerrar la vista ampliada (zoom). */
  readonly zoomChange = output<boolean>();

  /** Se emite cuando la posición del slider cambia por interacción. */
  readonly positionChange = output<number>();

  // ══════════════════════════════════════════════════════════════════════════
  // Valores resueltos (computed desde inputs agrupados)
  // ══════════════════════════════════════════════════════════════════════════

  /** Label visual de la imagen "antes". */
  readonly beforeLabel: Signal<string> = computed(() =>
    this.before().label ?? DEFAULTS.beforeLabel,
  );

  /** Label visual de la imagen "después". */
  readonly afterLabel: Signal<string> = computed(() =>
    this.after().label ?? DEFAULTS.afterLabel,
  );

  /** Alt text completo de la imagen "antes". */
  readonly beforeFullAlt: Signal<string> = computed(() =>
    this.before().alt ?? (this.alt() ? `${this.beforeLabel()}: ${this.alt()}` : this.beforeLabel()),
  );

  /** Alt text completo de la imagen "después". */
  readonly afterFullAlt: Signal<string> = computed(() =>
    this.after().alt ?? (this.alt() ? `${this.afterLabel()}: ${this.alt()}` : this.afterLabel()),
  );

  /** Aria-label base del slider. */
  readonly comparisonLabel: Signal<string> = computed(() =>
    this.labels().comparison ?? DEFAULTS.comparisonLabel,
  );

  /** Aria-label del botón fullscreen. */
  readonly fullscreenLabel: Signal<string> = computed(() =>
    this.labels().fullscreen ?? DEFAULTS.fullscreenLabel,
  );

  /** Aria-label del botón cerrar zoom. */
  readonly closeLabel: Signal<string> = computed(() =>
    this.labels().close ?? DEFAULTS.closeLabel,
  );

  /** Aria-label completo del slider: combina comparisonLabel + alt. */
  readonly sliderLabel: Signal<string> = computed(() => {
    const base = this.comparisonLabel();
    return this.alt() ? `${base}: ${this.alt()}` : base;
  });

  /** Aspect-ratio resuelto. */
  readonly resolvedAspectRatio: Signal<string> = computed(() =>
    this.orientation().aspectRatio ?? DEFAULTS.aspectRatio,
  );

  /** Max-width resuelto. */
  readonly resolvedMaxWidth: Signal<string> = computed(() =>
    this.orientation().maxWidth ?? DEFAULTS.maxWidth,
  );

  /** Indica si el zoom está habilitado. */
  readonly zoomEnabled: Signal<boolean> = computed(() =>
    this.zoom().enabled ?? DEFAULTS.zoomEnabled,
  );

  // ══════════════════════════════════════════════════════════════════════════
  // Controlador de slider (lógica pura)
  // ══════════════════════════════════════════════════════════════════════════

  readonly slider = new SliderController({
    initialPosition: this.initialPosition(),
    announce: (pos) => {
      const before = Math.round(pos);
      const after = 100 - before;
      return `${this.beforeLabel()} ${before}%, ${this.afterLabel()} ${after}%`;
    },
  });

  // ══════════════════════════════════════════════════════════════════════════
  // Zoom state
  // ══════════════════════════════════════════════════════════════════════════

  /** true cuando la vista ampliada está activa. */
  readonly isZoomed = signal(false);

  /** true cuando el zoom usa la Fullscreen API del navegador. */
  readonly usingFullscreen = signal(false);

  /** true durante la animación de salida del zoom (fallback CSS). */
  readonly isLeaving = signal(false);

  /** ID del requestAnimationFrame pendiente para requestFullscreen. */
  #fsRequestId: number | null = null;

  // ══════════════════════════════════════════════════════════════════════════
  // Referencias al DOM
  // ══════════════════════════════════════════════════════════════════════════

  private readonly containerEl = viewChild.required<ElementRef<HTMLElement>>('container');

  // ══════════════════════════════════════════════════════════════════════════
  // Zoom
  // ══════════════════════════════════════════════════════════════════════════

  readonly #enterZoom = (): void => {
    if (!this.zoomEnabled()) return;

    const el = this.containerEl()?.nativeElement;
    if (document.fullscreenEnabled && el?.requestFullscreen) {
      // Optimistic: treat native fullscreen as in play so the CSS fallback
      // classes/backdrop never touch the element while the browser is
      // transitioning to fullscreen. Mutating the element (position: fixed,
      // enter animation) or its ancestors (carousel track transform) during
      // that transition makes Chrome abort the fullscreen and revert to the
      // previous window size.
      this.usingFullscreen.set(true);
      this.isZoomed.set(true);
      this.zoomChange.emit(true);

      // Let Angular commit the zoom freeze on the carousel track and settle
      // layout BEFORE requesting fullscreen, so no ancestor transform changes
      // during the fullscreen transition.
      this.#fsRequestId = requestAnimationFrame(() => {
        this.#fsRequestId = null;
        el.requestFullscreen().catch(() => {
          // Denied or silent error → fall back to the CSS overlay.
          this.usingFullscreen.set(false);
        });
      });
      return;
    }
    // Fallback: CSS overlay
    this.isZoomed.set(true);
    this.zoomChange.emit(true);
  };

  readonly #exitZoom = (): void => {
    if (this.#fsRequestId !== null) {
      cancelAnimationFrame(this.#fsRequestId);
      this.#fsRequestId = null;
    }
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    this.isZoomed.set(false);
  };

  readonly toggleZoom = (): void => {
    if (!this.zoomEnabled()) return;

    if (this.isZoomed()) {
      this.#exitZoom();
      this.zoomChange.emit(false);
    } else {
      this.#enterZoom();
    }
  };

  readonly closeZoom = (): void => {
    if (!this.isZoomed()) return;
    if (!this.zoomEnabled()) return;

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

  constructor() {
    const destroyRef = inject(DestroyRef);

    // Resetear slider al cambiar resetKey (navegación del carrusel)
    effect(() => {
      this.resetKey();
      this.slider.reset(this.initialPosition());
    });

    // Salir del zoom si el componente deja de ser activo o se deshabilita
    effect(() => {
      if ((!this.active() || !this.zoomEnabled()) && this.isZoomed()) {
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

  // ══════════════════════════════════════════════════════════════════════════
  // Teclado
  // ══════════════════════════════════════════════════════════════════════════

  readonly onKeydown = (event: KeyboardEvent): void => {
    // Enter/Space: toggle zoom (solo si habilitado)
    if (this.zoomEnabled() && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      event.stopPropagation();
      this.toggleZoom();
      return;
    }

    // ← → Home End: slider (delegado al controlador)
    if (this.slider.onKeydown(event)) {
      this.positionChange.emit(this.slider.position());
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Pointer
  // ══════════════════════════════════════════════════════════════════════════

  readonly onPointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.slider.startDrag(event);
    // Actualizar posición inmediatamente al hacer click
    const rect = target.getBoundingClientRect();
    this.slider.updateDrag(event, rect.width);
  };

  readonly onPointerMove = (event: PointerEvent): void => {
    if (!this.slider.isDragging()) return;
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    this.slider.updateDrag(event, target.getBoundingClientRect().width);
  };

  readonly onPointerUp = (event: PointerEvent): void => {
    this.slider.endDrag();
    this.positionChange.emit(this.slider.position());
  };

  // ══════════════════════════════════════════════════════════════════════════
  // Swipe
  // ══════════════════════════════════════════════════════════════════════════

  /** Maneja swipe detectado por SwipeDirective: sale del zoom y re-emite. */
  readonly onContainerSwipe = (direction: 1 | -1): void => {
    if (this.isZoomed()) {
      this.#exitZoom();
      this.zoomChange.emit(false);
    }
    this.swipe.emit(direction);
  };
}
