import { Component, input, output } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';
import type { SvgIconName } from '../../types/icon.types';
import type { CtaButtonVariant } from '../../types/button.types';

@Component({
  selector: 'app-cta-button',
  standalone: true,
  imports: [SvgIcon],
  templateUrl: './cta-button.html',
  styleUrl: './cta-button.css',
  host: {
    'class': 'app-cta-button',
  },
})
/**
 * Botón de llamada a la acción con variantes primary/secondary.
 *
 * Renderiza `<a>` cuando se provee `href`, o `<button>` cuando no.
 * Soporta icono opcional después del label y modo external para links
 * que abren en nueva pestaña.
 *
 * @usage
 * ```html
 * <app-cta-button label="Reservar" (clicked)="onReservar()" />
 * <app-cta-button label="Ver más" variant="secondary" iconAfter="arrow-right" href="/servicios" />
 * <app-cta-button label="WhatsApp" iconAfter="message-circle" href="https://wa.me/..." [external]="true" />
 * ```
 */
export class CtaButton {
  readonly label = input.required<string>();
  readonly variant = input<CtaButtonVariant>('primary');

  /**
   * Cuando se setea, renderiza un <a> en vez de <button>.
   * Útil para links externos o navegación nativa.
   */
  readonly href = input<string>();

  /**
   * Solo aplica en modo link (href seteado).
   * Agrega target="_blank" y rel="noopener noreferrer".
   */
  readonly external = input(false);

  /**
   * Nombre del icono opcional (SvgIconName) para mostrar después del label.
   */
  readonly iconAfter = input<SvgIconName>();

  /** Solo aplica en modo button (sin href). */
  readonly clicked = output<void>();
}
