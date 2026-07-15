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
export class AppBadge {
  /** Badge a renderizar. El color, icono y label vienen del JSON.
   *  Acepta cualquier objeto que cumpla la interfaz Badge, sin
   *  importar el dominio de origen. */
  readonly badge = input.required<Badge>();
}
