import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';
import { ServiceService } from '../../domains/services/service.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [SectionHeader, ServiceCard, WhatsappButtonComponent],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class ServicesComponent {
  private readonly serviceService = inject(ServiceService);
  private readonly contentService = inject(ContentService);
  readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });
  readonly hasError = this.serviceService.error;
  readonly servicesTitle = computed(() => this.contentService.data().services.title);
  readonly servicesSubtitle = computed(() => this.contentService.data().services.subtitle);

  onBook(serviceId: string): void {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
