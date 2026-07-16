import { Component, computed, DestroyRef, inject } from '@angular/core';
import { afterNextRender } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  CarouselController,
  Carousel,
  EmptyState,
  ErrorBoundary,
  SectionHeader,
  TestimonialCard,
} from '../../shared';
import { TestimonialService } from '../../domains/testimonials/testimonial.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [Carousel, EmptyState, ErrorBoundary, SectionHeader, TestimonialCard],
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
  readonly noTestimonialsContent = computed(() => this.contentService.data().emptyState.noTestimonials);

  /** Testimonio activo según el índice del carrusel. */
  readonly currentTestimonial = computed(() =>
    this.testimonials()[this.carousel.currentIndex()],
  );

  /** Carrusel reutilizable. */
  readonly carousel = new CarouselController({
    totalItems: computed(() => this.testimonials().length),
    autoPlayInterval: 6000,
    destroyRef: inject(DestroyRef),
  });
}
