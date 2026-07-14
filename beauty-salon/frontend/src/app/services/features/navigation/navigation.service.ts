import { computed, Injectable, signal } from '@angular/core';
import type { NavItem } from '../../../domains/navigation/navigation.model';

export interface NavigationData {
  readonly nav: readonly NavItem[];
  readonly footerLinks: readonly NavItem[];
  readonly ctaReservar: string;
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly url = 'assets/data/navigation/navigation.json';

  private readonly FALLBACK: NavigationData = {
    nav: [],
    footerLinks: [],
    ctaReservar: '',
  };

  /** Signal pública con el objeto completo */
  readonly data = signal<NavigationData>(this.FALLBACK);

  /** Signal de loading */
  readonly loading = signal(true);

  /** Signal de error */
  readonly error = signal<string | null>(null);

  /** Signals derivadas para acceso directo sin navegar data() */
  readonly nav = computed(() => this.data().nav);
  readonly footerLinks = computed(() => this.data().footerLinks);
  readonly ctaReservar = computed(() => this.data().ctaReservar);

  constructor() {
    this.#load();
  }

  async #load(): Promise<void> {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: NavigationData = await res.json();
      this.data.set(json);
    } catch (cause) {
      this.error.set('No se pudieron cargar los datos de navegación');
      console.error('[NavigationService] Error loading navigation.json:', cause);
    } finally {
      this.loading.set(false);
    }
  }
}
