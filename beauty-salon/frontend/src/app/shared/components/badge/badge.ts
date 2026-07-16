import { Component, input } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';
import type { Badge } from '../../types/badge.types';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [SvgIcon],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
  host: {
    'class': 'app-badge',
  },
})
/**
 * Badge visual con color e icono opcional.
 *
 * Renderiza un `<span>` con un ícono SVG opcional y texto.
 * El color se mapea desde la propiedad `Badge.color` a variables CSS
 * definidas en el Design System.
 *
 * @usage
 * ```html
 * <app-badge [badge]="{ label: 'Nuevo', color: 'success', icon: 'sparkles', priority: 10, id: 'new' }" />
 * ```
 */
export class AppBadge {
  /** Badge a renderizar. El color, icono y label vienen del JSON.
   *  Acepta cualquier objeto que cumpla la interfaz Badge, sin
   *  importar el dominio de origen. */
  readonly badge = input.required<Badge>();
}
