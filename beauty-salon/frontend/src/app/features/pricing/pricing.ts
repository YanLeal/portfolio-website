import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { ServiceService } from '../../core/services/service.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [SectionHeader],
  host: { class: 'section-padding' },
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class PricingComponent {
  private readonly serviceService = inject(ServiceService);
  private readonly configService = inject(ConfigService);
  readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });
  readonly hasError = this.serviceService.error;
  readonly pricingTitle = computed(() => this.configService.config()?.sections.pricing.title ?? 'Precios');
  readonly pricingSubtitle = computed(() => this.configService.config()?.sections.pricing.subtitle ?? 'Transparencia desde el inicio');
}
