import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

export interface SiteConfig {
  site: {
    name: string;
    url: string;
    description: string;
  };
  navigation: {
    nav: { label: string; fragment: string }[];
    footerLinks: { label: string; fragment: string }[];
  };
  contact: {
    phone: { display: string; tel: string };
    whatsapp: string;
    email: string;
    address: string;
    social: { instagram: string; facebook: string };
    schedule: { label: string; hours: string }[];
  };
  sections: {
    hero: {
      tagline: string;
      description: string;
      ctaLabel: string;
      ctaSecondaryLabel: string;
    };
    about: {
      title: string;
      subtitle: string;
      paragraphs: string[];
      stats: { value: string; label: string }[];
    };
    services: { title: string; subtitle: string };
    pricing: { title: string; subtitle: string };
    gallery: { title: string; subtitle: string };
    team: { title: string; subtitle: string };
    testimonials: { title: string; subtitle: string };
    process: { title: string; subtitle: string };
    contact: {
      title: string;
      subtitle: string;
      wizardSteps: string[];
      timeSlots: { morning: string[]; afternoon: string[] };
    };
  };
  shared: {
    ctaReservar: string;
    ctaWhatsapp: string;
    ctaConsultaWhatsapp: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);

  private readonly config$ = this.http.get<SiteConfig>('assets/data/config.json').pipe(
    shareReplay(1),
    catchError(() => {
      console.error('[ConfigService] Error loading config.json');
      return of(null);
    }),
  );

  readonly config = toSignal(this.config$, { initialValue: null });
}
