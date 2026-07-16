import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorBoundary } from '../../shared/components/error-boundary/error-boundary';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { ServiceService } from '../../domains/services/service.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [ErrorBoundary, SectionHeader],
  host: { class: 'section-padding' },
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class PricingComponent {
  private readonly serviceService = inject(ServiceService);
  private readonly contentService = inject(ContentService);
  readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });
  readonly hasError = this.serviceService.error;
  readonly pricingTitle = computed(() => this.contentService.data().pricing.title);
  readonly pricingSubtitle = computed(() => this.contentService.data().pricing.subtitle);
}
