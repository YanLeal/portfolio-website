import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SERVICES } from '../../core/data/content';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [SectionHeader],
  templateUrl: './pricing.html',
})
export class PricingComponent {
  readonly services = SERVICES;
}
