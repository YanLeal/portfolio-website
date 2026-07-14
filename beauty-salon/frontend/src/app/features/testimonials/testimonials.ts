import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { TestimonialCard } from '../../shared/components/testimonial-card/testimonial-card';
import { TestimonialService } from '../../domains/testimonials/testimonial.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [SectionHeader, TestimonialCard],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class TestimonialsComponent {
  private readonly testimonialService = inject(TestimonialService);
  private readonly contentService = inject(ContentService);
  readonly testimonials = toSignal(this.testimonialService.getAll(), { initialValue: [] });
  readonly hasError = this.testimonialService.error;
  readonly testimonialsTitle = computed(() => this.contentService.data().testimonials.title);
  readonly testimonialsSubtitle = computed(() => this.contentService.data().testimonials.subtitle);
}
