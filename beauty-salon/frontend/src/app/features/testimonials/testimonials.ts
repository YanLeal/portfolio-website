import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { TestimonialCard } from '../../shared/components/testimonial-card/testimonial-card';
import { TESTIMONIALS } from '../../core/data/content';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [SectionHeader, TestimonialCard],
  templateUrl: './testimonials.html',
})
export class TestimonialsComponent {
  readonly testimonials = TESTIMONIALS;
}
