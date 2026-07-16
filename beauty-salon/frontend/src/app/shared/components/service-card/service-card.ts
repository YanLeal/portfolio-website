import { Component, input, output } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Card } from '../card/card';
import { Badge as BadgeComponent } from '../badge/badge';
import type { Badge } from '../../types';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [SvgIcon, Card, BadgeComponent],
  host: { class: 'card-entrance' },
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
})
/**
 * Card de servicio con imagen, badges, metadata y botón de acción.
 *
 * Recibe props planas (no modelos de dominio) para mantenerse
 * puro y reutilizable. Composición interna: `<app-card>` con
 * slots `cardMedia` y `cardBody`, más `<app-badge>` para badges.
 *
 * @usage
 * ```html
 * <app-service-card
 *   [id]="service.id" [name]="service.name"
 *   [description]="service.description"
 *   [priceLabel]="'$ ' + service.price.toLocaleString('es-AR')"
 *   [duration]="service.duration" [icon]="service.icon"
 *   [image]="service.image" [badges]="service.badges ?? []"
 *   buttonLabel="Reservar"
 *   (action)="onAction($event)"
 * />
 * ```
 */
export class ServiceCard {
  readonly id = input.required<string>();
  readonly name = input.required<string>();
  readonly description = input.required<string>();
  readonly priceLabel = input.required<string>();
  readonly duration = input.required<string>();
  readonly icon = input.required<string>();
  readonly image = input<string>();
  readonly badges = input<readonly Badge[]>();
  readonly buttonLabel = input.required<string>();
  readonly action = output<string>();
}
