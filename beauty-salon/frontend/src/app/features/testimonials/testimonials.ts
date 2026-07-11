import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { TestimonialCard } from '../../shared/components/testimonial-card/testimonial-card';
import { TestimonialService } from '../../core/services/testimonial.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [SectionHeader, TestimonialCard],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class TestimonialsComponent {
  private readonly testimonialService = inject(TestimonialService);
  readonly testimonials = toSignal(this.testimonialService.getAll(), { initialValue: [] });
}
