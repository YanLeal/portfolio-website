import { Component, computed, input } from '@angular/core';
import type { LoadingVariant, LoadingSize, SkeletonType } from '../../types';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [],
  templateUrl: './loading.html',
  styleUrl: './loading.css',
  host: { class: 'app-loading' },
})
/**
 * Loading — spinner, dots o pulse para estados de carga.
 *
 * @usage
 * ```html
 * <!-- Spinner default -->
 * <app-loading />
 *
 * <!-- Con texto -->
 * <app-loading label="Cargando servicios…" />
 *
 * <!-- Dots -->
 * <app-loading variant="dots" size="sm" />
 *
 * <!-- Pulse (skeleton shimmer) -->
 * <app-loading variant="pulse" size="lg" />
 * ```
 */
export class Loading {
  /** Variante visual. */
  readonly variant = input<LoadingVariant>('spinner');

  /** Tamaño del indicador. */
  readonly size = input<LoadingSize>('md');

  /** Tipo de skeleton (solo cuando variant='skeleton'). */
  readonly skeleton = input<SkeletonType>('text');

  /** Cantidad de líneas (solo para skeleton type 'text'). */
  readonly lines = input(3);

  /** Texto visible debajo del indicador. Opcional. */
  readonly label = input<string>();

  /** Override del texto para lectores de pantalla.
   *  Si no se setea, se usa `label()` o "Cargando…" por defecto. */
  readonly labelScreenReader = input<string>();

  /** Array para iterar las líneas del skeleton 'text'. */
  readonly skeletonLines = computed(() => Array.from({ length: this.lines() }));
}
