import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { TestimonialCard } from '../../shared/components/testimonial-card/testimonial-card';
import { TestimonialService } from '../../core/services/testimonial.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [SectionHeader, TestimonialCard],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class TestimonialsComponent {
  private readonly testimonialService = inject(TestimonialService);
  private readonly configService = inject(ConfigService);
  readonly testimonials = toSignal(this.testimonialService.getAll(), { initialValue: [] });
  readonly hasError = this.testimonialService.error;
  readonly testimonialsTitle = computed(() => this.configService.config()?.sections.testimonials.title ?? 'Testimonios');
  readonly testimonialsSubtitle = computed(() => this.configService.config()?.sections.testimonials.subtitle ?? 'Lo que dicen nuestras clientas');
}
