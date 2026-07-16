import { Component, input, output } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';
import type { SvgIconName } from '../../types';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [SvgIcon],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css',
  host: { class: 'app-empty-state' },
})
/**
 * EmptyState — estado vacío para listas, búsquedas y pantallas sin datos.
 *
 * Muestra un mensaje descriptivo con opción de icono SVG, imagen ilustrativa
 * y un botón de acción.
 *
 * @usage
 * ```html
 * <!-- Básico -->
 * <app-empty-state
 *   title="Sin resultados"
 *   description="No encontramos nada con ese filtro."
 *   icon="search"
 * />
 *
 * <!-- Con botón de acción -->
 * <app-empty-state
 *   title="No hay servicios aún"
 *   description="Agregá tu primer servicio para empezar."
 *   icon="sparkles"
 *   button="Agregar servicio"
 *   (buttonClicked)="onAddService()"
 * />
 *
 * <!-- Con ilustración -->
 * <app-empty-state
 *   title="Página no encontrada"
 *   description="La página que buscás no existe o fue movida."
 *   image="/assets/illustrations/404.svg"
 *   button="Volver al inicio"
 *   (buttonClicked)="goHome()"
 * />
 * ```
 */
export class EmptyState {
  // ── Texto ─────────────────────────────────────────────────────

  /** Título principal del estado vacío (requerido). */
  readonly title = input.required<string>();

  /** Texto secundario explicativo. */
  readonly description = input<string>();

  // ── Visual ────────────────────────────────────────────────────

  /** Nombre del icono SVG decorativo (se ignora si `image` está presente). */
  readonly icon = input<SvgIconName>();

  /** URL de ilustración. Reemplaza al icono cuando está presente. */
  readonly image = input<string>();

  // ── Acción ────────────────────────────────────────────────────

  /** Label del botón de acción. Si no se setea, el botón no se muestra. */
  readonly button = input<string>();

  /** Emitido al hacer click en el botón de acción. */
  readonly buttonClicked = output<void>();

  // ── Handlers ──────────────────────────────────────────────────

  protected onButtonClick(): void {
    this.buttonClicked.emit();
  }
}
