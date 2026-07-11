import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { ServiceService } from '../../core/services/service.service';

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
  readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });
}
