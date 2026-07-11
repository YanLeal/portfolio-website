import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { ServiceCard } from '../../shared/components/service-card/service-card';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';
import { ServiceService } from '../../core/services/service.service';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [SectionHeader, ServiceCard, WhatsappButtonComponent],
  templateUrl: './services.html',
  styleUrl: './services.css',
})
export class ServicesComponent {
  private readonly serviceService = inject(ServiceService);
  readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });

  onBook(serviceId: string): void {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
