import { Component, input, output } from '@angular/core';
import { SvgIcon, type SvgIconName } from '../svg-icon/svg-icon';

export type CtaButtonVariant = 'primary' | 'secondary';

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
