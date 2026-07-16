import { Component, input } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  imports: [SvgIcon],
  host: { class: 'card-entrance' },
  templateUrl: './testimonial-card.html',
  styleUrl: './testimonial-card.css',
})
/**
 * Card de testimonio con foto, rating, quote y datos de autor.
 *
 * Recibe props planas (name, photo, text, rating, service) para
 * mantenerse independiente del modelo de dominio. Renderiza
 * estrellas inline (no usa svg-icon) y foto duplicada para
 * background y avatar.
 *
 * @usage
 * ```html
 * <app-testimonial-card
 *   name="María" photo="maria.jpg" text="Excelente servicio"
 *   [rating]="5" service="Corte + Brushing"
 * />
 * ```
 */
export class TestimonialCard {
  readonly name = input.required<string>();
  readonly photo = input.required<string>();
  readonly text = input.required<string>();
  readonly rating = input.required<number>();
  readonly service = input.required<string>();
}
