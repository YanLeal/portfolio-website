import { computed, Injectable, signal } from '@angular/core';
import type { BusinessConfig } from '../../../domains/business/business.model';

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly url = 'assets/data/business/business.json';

  private readonly FALLBACK: BusinessConfig = {
    site: { name: '', url: '', description: '', logo: '' },
    contact: {
      phone: { display: '', tel: '' },
      whatsapp: '',
      email: '',
      address: '',
      social: { instagram: '', facebook: '' },
      schedule: { regular: [] },
    },
    seo: {
      title: '',
      description: '',
      ogImage: '',
      ogLocale: 'es_AR',
      canonical: '',
    },
  };

  /** Signal raíz con el objeto completo de configuración */
  readonly data = signal<BusinessConfig>(this.FALLBACK);

  /** Loading: true hasta que el fetch resuelva o falle */
  readonly loading = signal(true);

  /** Error: null si todo OK, string con mensaje si falló */
  readonly error = signal<string | null>(null);

  // ── Computed Signals ─────────────────────────────────────

  /**
   * Sub-árbol `site`: name, url, description, logo.
   *
   * Valor: los componentes que solo leen `site.name` o `site.logo`
   * (header, about, footer) dependen de esta computed, no de `data()` entero.
   * Un cambio en `contact` o `seo` NO marca este computed como sucio.
   */
  readonly site = computed(() => this.data().site);

  /**
   * Sub-árbol `contact`: phone, whatsapp, email, address, social, schedule.
   *
   * Valor: es la sub-estructura más compartida (whatsapp-btn, footer,
   * contacto, promo, booking). Aísla su reactividad del resto de `data()`.
   */
  readonly contact = computed(() => this.data().contact);

  /**
   * Sub-árbol `seo`: title, description, ogImage, ogLocale, canonical.
   *
   * Valor: separa datos de SEO de los datos de presentación.
   */
  readonly seo = computed(() => this.data().seo);

  /**
   * Link telefónico formateado como `tel:` URI.
   *
   * Valor: centraliza el formato del número. Si la convención cambia
   * (ej: agregar código de país), se cambia en UN lugar.
   * Además depende de `contact` (no de `data`), así que cambios
   * en `site` o `seo` no lo afectan.
   */
  readonly phoneHref = computed(() => `tel:${this.contact().phone.tel}`);

  /**
   * Link de WhatsApp formateado como URL completa.
   *
   * Valor: mismo principio que `phoneHref`. El componente `whatsapp-btn`
   * hoy hace `computed(() => \`https://wa.me/...\`)` — este computed
   * mueve esa lógica al service, que es donde pertenece (es formato
   * de datos de negocio, no lógica de UI).
   */
  readonly whatsappUrl = computed(() => `https://wa.me/${this.contact().whatsapp}`);

  constructor() {
    this.#load();
  }

  async #load(): Promise<void> {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: BusinessConfig = await res.json();
      this.data.set(json);
    } catch (cause) {
      this.error.set('No se pudieron cargar los datos del negocio');
      console.error('[BusinessService] Error loading business.json:', cause);
    } finally {
      this.loading.set(false);
    }
  }
}
