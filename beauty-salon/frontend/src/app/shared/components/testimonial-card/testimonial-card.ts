import { Component, input } from '@angular/core';
import { Testimonial } from '../../../core/models/testimonial.model';

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  templateUrl: './testimonial-card.html',
  styleUrl: './testimonial-card.css',
})
export class TestimonialCard {
  readonly testimonial = input.required<Testimonial>();
}
