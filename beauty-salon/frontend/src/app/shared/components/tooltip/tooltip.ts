import { Component, input, signal } from '@angular/core';
import type { TooltipPosition } from './tooltip.types';

let tooltipIdCounter = 0;

/**
 * Tooltip contextual accesible.
 *
 * Aparece al hover (mouseenter) o foco (focusin) del trigger,
 * con un breve delay para evitar flickering.
 * El tooltip está siempre en el DOM; la visibilidad se controla
 * con CSS (opacity + visibility), garantizando que los lectores
 * de pantalla puedan anunciar la descripción via aria-describedby.
 *
 * @usage
 * ```html
 * <!-- Básico -->
 * <app-tooltip text="Guardar cambios">
 *   <button>💾</button>
 * </app-tooltip>
 *
 * <!-- Posición inferior -->
 * <app-tooltip text="Más información" position="bottom">
 *   <app-svg-icon name="info" />
 * </app-tooltip>
 *
 * <!-- Con delay personalizado -->
 * <app-tooltip text="Estadísticas" [delay]="500">
 *   <span tabindex="0">📊</span>
 * </app-tooltip>
 * ```
 */
@Component({
  selector: 'app-tooltip',
  standalone: true,
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
  host: { class: 'app-tooltip' },
})
export class Tooltip {
  /** Texto del tooltip. */
  readonly text = input.required<string>();

  /** Posición relativa al trigger. @default 'top' */
  readonly position = input<TooltipPosition>('top');

  /** Delay en ms antes de mostrar el tooltip. @default 300 */
  readonly delay = input(300);

  /** Desactiva el tooltip. @default false */
  readonly disabled = input(false);

  readonly tooltipId = `tooltip-${++tooltipIdCounter}`;
  readonly visible = signal(false);

  private showTimeout?: ReturnType<typeof setTimeout>;

  show(): void {
    if (this.disabled()) return;
    clearTimeout(this.showTimeout);
    this.showTimeout = setTimeout(() => this.visible.set(true), this.delay());
  }

  hide(): void {
    clearTimeout(this.showTimeout);
    this.visible.set(false);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.hide();
    }
  }
}
