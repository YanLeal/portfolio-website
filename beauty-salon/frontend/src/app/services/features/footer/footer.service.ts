import { Injectable, signal } from '@angular/core';
import type { FooterData } from './footer.model';

const FALLBACK: FooterData = {
  siteName: '',
  brandDescription: '',
  headings: { links: '', schedule: '', contact: '' },
  socialLinks: [],
  quickLinks: [],
  contactInfo: { address: '', phone: '', email: '' },
  copyrightText: '',
};

@Injectable({ providedIn: 'root' })
export class FooterService {
  private readonly url = 'assets/data/footer/footer.json';

  readonly data = signal<FooterData>(FALLBACK);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly year = new Date().getFullYear();

  constructor() {
    this.#load();
  }

  async #load(): Promise<void> {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: FooterData = await res.json();
      this.data.set(json);
    } catch (cause) {
      this.error.set('No se pudieron cargar los datos del footer');
      console.error('[FooterService] Error loading footer.json:', cause);
    } finally {
      this.loading.set(false);
    }
  }
}
