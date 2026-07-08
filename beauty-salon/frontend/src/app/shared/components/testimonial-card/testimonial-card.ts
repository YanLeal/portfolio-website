import { Component, input } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Testimonial } from '../../../core/models/testimonial.model';

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  imports: [SvgIcon],
  host: { class: 'card-entrance' },
  templateUrl: './testimonial-card.html',
  styleUrl: './testimonial-card.css',
})
export class TestimonialCard {
  readonly testimonial = input.required<Testimonial>();
}
