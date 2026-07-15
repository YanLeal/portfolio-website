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

  /** Servicios que tienen al menos un badge (destacados automáticamente
   *  desde el JSON). Sirve como fuente única para secciones promocionales
   *  sin duplicar lógica de filtrado. */
  readonly featuredServices = computed(() =>
    this.services().filter((s) => s.badges && s.badges.length > 0),
  );

  /** Servicios ordenados por prioridad promocional:
   *
   *  1. Los servicios con badges aparecen primero, ordenados por la
   *     prioridad más baja de sus badges (menor número = más prioritario).
   *  2. A igual prioridad de badge, se ordenan por sortOrder ascendente.
   *  3. Los servicios sin badges van al final, ordenados por sortOrder.
   *
   *  Esto asegura que servicios promocionados (con badge "Nuevo",
   *  "Popular", "Más vendido") aparezcan antes que el resto, sin
   *  perder el orden base entre ellos. */
  readonly servicesByPriority = computed(() =>
    [...this.services()].sort((a, b) => {
      const aMin = a.badges && a.badges.length > 0
        ? Math.min(...a.badges.map((b) => b.priority))
        : Infinity;
      const bMin = b.badges && b.badges.length > 0
        ? Math.min(...b.badges.map((b) => b.priority))
        : Infinity;

      if (aMin !== bMin) return aMin - bMin;
      return a.sortOrder - b.sortOrder;
    }),
  );

  readonly servicesTitle = computed(() => this.contentService.data().services.title);
  readonly servicesSubtitle = computed(() => this.contentService.data().services.subtitle);

  onBook(serviceId: string): void {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
