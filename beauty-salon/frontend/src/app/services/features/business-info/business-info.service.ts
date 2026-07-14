import { Injectable, signal } from '@angular/core';
import type { BusinessInfoData } from './business-info.model';

const FALLBACK: BusinessInfoData = {
  siteName: '',
  title: '',
  subtitle: '',
  image: '',
  imageAlt: '',
  paragraphLead: '',
  paragraphSecond: '',
  stats: [],
  ctaLabel: '',
};

@Injectable({ providedIn: 'root' })
export class BusinessInfoService {
  private readonly url = 'assets/data/business-info/business-info.json';

  readonly data = signal<BusinessInfoData>(FALLBACK);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.#load();
  }

  async #load(): Promise<void> {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: BusinessInfoData = await res.json();
      this.data.set(json);
    } catch (cause) {
      this.error.set('No se pudieron cargar los datos de la empresa');
      console.error('[BusinessInfoService] Error loading business-info.json:', cause);
    } finally {
      this.loading.set(false);
    }
  }
}
