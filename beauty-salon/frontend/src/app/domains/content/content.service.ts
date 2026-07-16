import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import type { ContentData } from './content.model';

const FALLBACK: ContentData = {
  hero: { businessName: '', tagline: '', description: '', ctaLabel: '', ctaSecondaryLabel: '' },
  about: { title: '', subtitle: '', paragraphs: [], stats: [] },
  services: { title: 'Servicios', subtitle: 'Todo lo que necesitas para mimarte' },
  pricing: { title: 'Precios', subtitle: 'Transparencia desde el inicio' },
  gallery: { title: 'Galería', subtitle: 'Mirá nuestro trabajo' },
  team: { title: 'Equipo', subtitle: 'Los profesionales que te van a atender' },
  testimonials: { title: 'Testimonios', subtitle: 'Lo que dicen nuestras clientas' },
  process: { title: 'Nuestro proceso', subtitle: 'Tu experiencia en 4 pasos' },
  emptyState: {
    noResults: {
      title: 'Sin resultados',
      description: 'No encontramos preguntas que coincidan con tu búsqueda. Prueba con otros términos o escríbenos por WhatsApp.',
    },
    noPromotions: {
      title: 'Sin promociones por ahora',
      description: 'No hay promociones activas en este momento. Seguinos en redes para enterarte de las próximas ofertas.',
    },
    noTestimonials: {
      title: 'Sin testimonios aún',
      description: 'Todavía no hay testimonios de clientas. ¡Sé la primera en dejarnos tu opinión!',
    },
  },
};

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly data$ = this.http
    .get<ContentData>('assets/data/content/content.json')
    .pipe(
      map((data) => ({
        ...FALLBACK,
        ...data,
        emptyState: { ...FALLBACK.emptyState, ...(data.emptyState ?? {}) },
      })),
      shareReplay(1),
      catchError(() => {
        console.error('[ContentService] Error loading content.json');
        return of(FALLBACK);
      }),
    );

  readonly data = toSignal(this.data$, { initialValue: FALLBACK });
}
