import { Injectable, signal } from '@angular/core';
import type { HeaderData } from './header.model';

const FALLBACK: HeaderData = {
  siteName: '',
  logoAriaLabel: '',
  menuAriaLabel: '',
  menuOpenLabel: '',
  menuCloseLabel: '',
};

@Injectable({ providedIn: 'root' })
export class HeaderService {
  private readonly url = 'assets/data/header/header.json';

  readonly data = signal<HeaderData>(FALLBACK);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.#load();
  }

  async #load(): Promise<void> {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: HeaderData = await res.json();
      this.data.set(json);
    } catch (cause) {
      this.error.set('No se pudieron cargar los datos del header');
      console.error('[HeaderService] Error loading header.json:', cause);
    } finally {
      this.loading.set(false);
    }
  }
}
