import { computed, Injectable, signal } from '@angular/core';
import type { FaqCategory, FaqItem } from './faq.model';

@Injectable({ providedIn: 'root' })
export class FaqService {
  private readonly url = 'assets/data/faq/faq.json';

  readonly faqs = signal<FaqItem[]>([]);
  readonly faqsOrdenadas = computed(() =>
    [...this.faqs()].sort((a, b) => a.order - b.order),
  );
  readonly categorias = computed<FaqCategory[]>(() => [
    ...new Set(this.faqsOrdenadas().map((f) => f.category)),
  ]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.#load();
  }

  async #load(): Promise<void> {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: FaqItem[] = await res.json();
      this.faqs.set(json);
    } catch (cause) {
      this.error.set('No se pudieron cargar las preguntas frecuentes');
      console.error('[FaqService] Error loading faq.json:', cause);
    } finally {
      this.loading.set(false);
    }
  }
}
