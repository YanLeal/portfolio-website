import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { SERVICES } from '../../core/data/content';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [SectionHeader, ServiceCard],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class ServicesComponent {
  readonly services = SERVICES;

  onBook(serviceId: string): void {
    // TODO: scroll to booking section or open modal
  }
}
