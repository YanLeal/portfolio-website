import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import type { ContentData } from './content.model';

const FALLBACK: ContentData = {
  hero: { businessName: '', tagline: '', description: '', ctaLabel: '', ctaSecondaryLabel: '' },
  about: { title: '', subtitle: '', paragraphs: [], stats: [] },
  services: { title: 'Servicios', subtitle: 'Todo lo que necesitás para mimarte' },
  pricing: { title: 'Precios', subtitle: 'Transparencia desde el inicio' },
  gallery: { title: 'Galería', subtitle: 'Mirá nuestro trabajo' },
  team: { title: 'Equipo', subtitle: 'Los profesionales que te van a atender' },
  testimonials: { title: 'Testimonios', subtitle: 'Lo que dicen nuestras clientas' },
  process: { title: 'Nuestro proceso', subtitle: 'Tu experiencia en 4 pasos' },
};

@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly data$ = this.http
    .get<ContentData>('assets/data/content/content.json')
    .pipe(
      shareReplay(1),
      catchError(() => {
        console.error('[ContentService] Error loading content.json');
        return of(FALLBACK);
      }),
    );

  readonly data = toSignal(this.data$, { initialValue: FALLBACK });
}
