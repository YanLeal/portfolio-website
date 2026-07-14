import { Injectable, signal } from '@angular/core';
import type { HeroContent } from './hero.model';

const FALLBACK: HeroContent = {
  businessName: '',
  tagline: '',
  description: '',
  ctaLabel: '',
  ctaSecondaryLabel: '',
  heroImage: '',
  scrollText: '',
  whatsappLabel: '',
  ariaLabel: '',
};

@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly url = 'assets/data/hero/hero.json';

  /** Signal pública con los datos del hero — nunca es undefined */
  readonly hero = signal<HeroContent>(FALLBACK);

  /** Signal de loading */
  readonly loading = signal(true);

  /** Signal de error */
  readonly error = signal<string | null>(null);

  constructor() {
    this.#load();
  }

  async #load(): Promise<void> {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: HeroContent = await res.json();
      this.hero.set(json);
    } catch (cause) {
      this.error.set('No se pudieron cargar los datos del hero');
      console.error('[HeroService] Error loading hero.json:', cause);
    } finally {
      this.loading.set(false);
    }
  }
}
