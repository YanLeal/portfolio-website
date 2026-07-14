# Data Architecture

> Cómo fluye la data desde el archivo JSON hasta el template, y cómo organizar
> services, modelos y signals para mantener una única fuente de verdad.

---

## Índice

1. [Flujo de datos](#flujo-de-datos)
2. [Organización de directorios](#organización-de-directorios)
3. [Dos capas de datos](#dos-capas-de-datos)
4. [Services](#services)
5. [Models / Interfaces](#models--interfaces)
6. [Signals](#signals)
7. [Buenas prácticas](#buenas-prácticas)
8. [Mapa de dependencias](#mapa-de-dependencias)
9. [Hoja de ruta](#hoja-de-ruta)

---

## Flujo de datos

El pipeline completo sigue una dirección única, sin ciclos:

```
JSON file
   │
   ▼ fetch() / HttpClient
Service (singleton)
   │
   ▼ signal()
Signal público (writable)
   │
   ▼ computed() (opcional)
Señales derivadas (granularidad reactiva)
   │
   ▼ inyección
Component
   │
   ▼ {{ signal() }} / [binding]
Template
```

### Regla fundamental

> Los datos fluyen **hacia abajo**. Un service nunca conoce al componente que lo
> consume. Un JSON nunca referencia a otro JSON. Un componente nunca escribe en
> un service de datos (solo lee).

### Ejemplo concreto

```
hero.json
  │ fetch()
  ▼
HeroService.hero  (signal<HeroContent>)
  │
  ▼ inyectado como
HeroComponent.content  (referencia directa a la signal)
  │
  ▼ {{ content().businessName }}
  ▼ [ngSrc]="content().heroImage"
  ▼ {{ content().scrollText }}
hero.html
```

---

## Organización de directorios

```
public/assets/data/           ← JSON files (fuente de datos)
├── hero/
│   └── hero.json
├── header/
│   └── header.json
├── footer/
│   └── footer.json
├── business-info/
│   └── business-info.json
├── business/
│   └── business.json          ← Entity: site, contact, seo
├── navigation/
│   └── navigation.json        ← Entity: nav links
├── content/
│   └── content.json           ← Entity: section headers, about, hero
├── services/
│   └── services.json
├── gallery/
│   └── gallery.json
├── team/
│   └── team.json
├── testimonials/
│   └── testimonials.json
├── process/
│   └── process.json
├── contact/
│   └── contact.json
└── promotions/
    └── promotions.json

src/app/
├── domains/                   ← Servicios de dominio (HttpClient)
│   ├── business/
│   │   ├── business.model.ts
│   │   └── business.service.ts
│   ├── navigation/
│   │   ├── navigation.model.ts
│   │   └── navigation.service.ts
│   └── ...
│
├── services/                  ← Servicios de feature (fetch)
│   ├── data/                  ← Capa técnica
│   │   ├── http.service.ts
│   │   ├── cache.service.ts
│   │   └── storage.service.ts
│   ├── shared/                ← Utilidades
│   │   ├── scroll.service.ts
│   │   ├── window.service.ts
│   │   └── date.service.ts
│   └── features/              ← Services específicos por sección
│       ├── hero/
│       │   ├── hero.model.ts
│       │   └── hero.service.ts
│       ├── header/
│       │   ├── header.model.ts
│       │   └── header.service.ts
│       ├── footer/
│       │   ├── footer.model.ts
│       │   └── footer.service.ts
│       └── business-info/
│           ├── business-info.model.ts
│           └── business-info.service.ts
│
├── features/                  ← Componentes de sección
│   ├── about/
│   ├── services/
│   ├── pricing/
│   ├── gallery/
│   ├── team/
│   ├── testimonials/
│   ├── process/
│   ├── contact/
│   └── promo/
│
└── layout/                    ← Componentes de layout
    ├── header/
    ├── footer/
    └── pages/
```

---

## Dos capas de datos

Existen dos tipos de archivos JSON, cada uno con un propósito distinto.

### Capa 1: Entity JSONs — unique source of truth

Contienen datos de **entidades del mundo real** (negocio, navegación, contenido).
Son la autoridad para sus respectivos datos. Ningún otro JSON duplica su
información (o no debería).

| Archivo | Entidad | Ejemplos |
|---|---|---|
| `business.json` | Negocio | site.name, contact, schedule, social, seo |
| `content.json` | Secciones | about, section headers, stats |
| `navigation.json` | Navegación | nav links, footer links, CTA |

Cargados por **domain services** (`domains/*/`).

### Capa 2: Section JSONs — view projections

Contienen datos **exclusivos de una sección visual**. Lo que es único de esa
sección y no existe en ninguna entidad.

| Archivo | Datos únicos (solo estos pertenecen acá) |
|---|---|
| `hero.json` | tagline, description, heroImage, scrollText, whatsappLabel, ariaLabel, ctaSecondaryLabel |
| `header.json` | logoAriaLabel, menuAriaLabel, menuOpenLabel, menuCloseLabel |
| `footer.json` | brandDescription, headings, copyrightText |
| `business-info.json` | paragraphLead, paragraphSecond |

Cargados por **feature services** (`services/features/*/`).

### Problema: duplicación actual

Históricamente los Section JSONs copiaron datos que ya existían en Entity
JSONs. Por ejemplo, `"Belleza & Estilo"` aparece en **6 archivos** distintos
y `"Reservá tu turno"` en **4**. La meta es migrar a una arquitectura de
composición donde los Section JSONs solo contengan datos únicos y los datos
compartidos se obtengan de los Entity Services.

```
Estado deseado:

hero.json (solo campos únicos)
    │                          ┌── business.json (site.name)
    │                          │
    ▼ fetch                    ▼ inject
heroDataSignal ─── computed ────→ { businessName, tagline, heroImage, ... }
                                        ▲
                                   HeroComponent.data()

Estado actual (con deuda técnica):

hero.json → heroDataSignal → HeroComponent.data()
  └── businessName duplicado de business.json
  └── ctaLabel duplicado de navigation.json
```

---

## Services

### Domain services (`domains/`)

- **Transporte:** `HttpClient` de Angular
- **Estado:** `Observable` → `toSignal()` (patrón legacy)
- **Ubicación:** Junto a su modelo en `domains/<entity>/`
- **Responsabilidad:** Cargar datos de entidades, exponer `data` signal
- **Scoped a:** root

```typescript
@Injectable({ providedIn: 'root' })
export class ContentService {
  private readonly http = inject(HttpClient);

  private readonly data$ = this.http.get<ContentData>('assets/data/content/content.json').pipe(
    shareReplay(1),
    catchError(() => of(FALLBACK)),
  );

  readonly data = toSignal(this.data$, { initialValue: FALLBACK });
}
```

### Feature services (`services/features/`)

- **Transporte:** `fetch()` nativo del browser
- **Estado:** `signal()` puro (seteado manualmente)
- **Ubicación:** En `services/features/<section>/`
- **Responsabilidad:** Cargar datos de sección, exponer `data` signal + `loading` + `error`
- **Scoped a:** root

```typescript
@Injectable({ providedIn: 'root' })
export class HeroService {
  private readonly url = 'assets/data/hero/hero.json';

  readonly hero = signal<HeroContent>(FALLBACK);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() { this.#load(); }

  async #load(): Promise<void> {
    try {
      const res = await fetch(this.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.hero.set(await res.json());
    } catch (cause) {
      this.error.set('Mensaje de error');
    } finally {
      this.loading.set(false);
    }
  }
}
```

### Diferencia clave

| Aspecto | Domain Service | Feature Service |
|---|---|---|
| HTTP | `HttpClient` + RxJS | `fetch()` nativo |
| Señal | `toSignal(observable)` | `signal.set(valor)` |
| Loading | No expone | `signal(true/false)` |
| Error | `catchError` → fallback | `signal(null \| string)` |
| Resiliencia | Timeout/retry vía RxJS | `try/catch/finally` |
| Dependencias | Solo Angular | Solo browser APIs |

### Services huérfanos

Los siguientes services existen pero no los consume ningún componente:

- `services/features/business/business.service.ts`
- `services/features/navigation/navigation.service.ts`

Fueron creados como parte de la migración pero nunca se conectaron. Los
componentes siguen usando los domain services originales.

---

## Models / Interfaces

### Dónde ubicarlas

| Tipo de modelo | Ubicación |
|---|---|
| Modelo de entidad (BusinessConfig, NavItem) | `domains/<entity>/<entity>.model.ts` |
| Modelo de sección (HeroContent, HeaderData) | `services/features/<section>/<section>.model.ts` |
| DTO de vista (FooterData, FooterContactEntry) | Junto al service que lo compone |

### Principios

1. **El modelo viaja con el service que lo expone.** No existe un `models/`
   global. Cada service es dueño de su interfaz.

2. **Un modelo de entidad puede coexistir con un modelo de sección con el
   mismo nombre** en archivos distintos. Nunca se importan juntos en el mismo
   archivo, así que no hay conflicto.

3. **`readonly` en todas las propiedades.** Los datos vienen de JSON, no se
   mutan después de cargados. `readonly` previene mutaciones accidentales.

4. **Arrays tipados con `readonly`.** Usar `readonly SomeType[]` en vez de
   `SomeType[]` para que el array no pueda ser reasignado ni mutado.

```typescript
// services/features/hero/hero.model.ts
export interface HeroContent {
  readonly businessName: string;
  readonly tagline: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaSecondaryLabel: string;
  readonly heroImage: string;
  readonly scrollText: string;
  readonly whatsappLabel: string;
  readonly ariaLabel: string;
}
```

```typescript
// domains/business/business.model.ts
export interface BusinessConfig {
  readonly site: BusinessSite;
  readonly contact: BusinessContact;
  readonly seo: BusinessSeo;
}

export interface BusinessSite {
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly logo?: string;
}
```

---

## Signals

### Patrón estándar para feature services

Cada feature service expone tres señales:

```typescript
readonly data   = signal<T>(FALLBACK);    // ← los datos, nunca undefined
readonly loading = signal(true);           // ← true hasta que fetch resuelva
readonly error   = signal<string | null>(null); // ← null si OK, string si falló
```

### Por qué `signal` y no `computed` para la data principal

| Señal | Cuándo usarla |
|---|---|
| `signal(T)` | La fuente de datos primaria. El service escribe en ella. |
| `computed(...)` | Una derivación. No se escribe directamente. |

En un service de datos, la signal principal es `signal()` porque el service
**setea** el valor cuando el fetch resuelve. Las derivaciones (`computed`) se
usan para exponer sub-árboles del dato principal y crear boundaries de
reactividad.

### Reactividad granular con `computed`

```typescript
// BusinessService — expone sub-árboles como computed
readonly site    = computed(() => this.data().site);
readonly contact = computed(() => this.data().contact);
readonly seo     = computed(() => this.data().seo);
```

Cada `computed` es un **boundary de reactividad**. Un componente que lee
`site()` solo se marca como dirty cuando cambia `data().site`, no cuando
cambia `data().contact` o `data().seo`.

Sin estos computed, un componente que lee `data().site.name` depende de
**todo** `data()`. Cualquier cambio mínimo en cualquier parte de la señal
arrastra a todos los consumidores.

### Loading derivado con `computed`

```typescript
// HeroService — loading es un computed
readonly loading = computed(() => !this.hero().businessName);
```

En vez de setear `loading` manualmente en el constructor (lo que falla si el
fetch resuelve después del constructor), se deriva del estado real de los
datos. Apenas `businessName` tiene valor, `loading` pasa a `false`.

### Regla: Signals en el componente

```typescript
// ✅ Bien — señal directa, sin wrapper
readonly content = this.heroService.hero;

// ❌ Mal — computed innecesario sobre una señal que ya es reactiva
readonly content = computed(() => this.heroService.hero());

// ❌ Mal — convertir signal a observable y devolver a signal
readonly content = toSignal(from(this.heroService.hero));
```

Si el service expone una `signal<T>`, el componente la asigna directamente.
Un `computed` solo se justifica cuando hay transformación de datos (ej:
mapear, formatear, filtrar), no para un pass-through.

---

## Buenas prácticas

### 1. Un JSON file por sección, pero sin duplicar entidades

Cada sección visual tiene su propio JSON con sus **datos exclusivos**. Los
datos compartidos (siteName, schedule, contact info) se obtienen del entity
service correspondiente mediante composición en el feature service.

### 2. Nunca dos services carguen el mismo JSON

Si dos services hacen fetch del mismo archivo, hay dos requests, dos estados,
y posibilidad de inconsistency. Si dos componentes necesitan el mismo dato,
que un service lo cargue y los componentes lo inyecten.

### 3. Fallback completo, nunca undefined

```typescript
const FALLBACK: HeroContent = {
  businessName: '',    // ← string vacío, no undefined
  tagline: '',
  // ...
};

readonly hero = signal<HeroContent>(FALLBACK);
```

Angular renderiza `{{ undefined }}` como vacío, pero `undefined.field` rompe
en runtime. Un fallback con todas las propiedades previene errores.

### 4. Tres señales por service de feature

Siempre exponer `data`, `loading` y `error`. Incluso si el componente no usa
`loading` hoy, el service está completo y cualquier consumidor futuro puede
mostrar un skeleton o un mensaje de error sin modificar el service.

### 5. Composición sobre herencia

Un section service que necesita datos de una entidad **inyecta** el entity
service y compone con `computed`:

```typescript
// ✅ Bien — composición
class HeroService {
  private readonly businessService = inject(BusinessService);
  readonly hero = computed(() => ({
    businessName: this.businessService.data().site.name,
    ...this.localData(),
  }));
}
```

No hereda, no duplica, no hace fetch extra.

### 6. El componente inyecta un solo service

Cada componente inyecta **un único service** de feature. El service internamente
puede componer de múltiples fuentes, pero el componente trata con una sola
señal `data()`. Esto simplifica tests y mantenimiento.

```
✅ HeroComponent → HeroService (1 inyección)
✅ HeaderComponent → HeaderService (1 inyección)
❌ (obsoleto) ContactComponent → ContactService + ServiceService + BusinessService (3 inyecciones)
```

### 7. El modelo vive con el service, no en una carpeta global

Cada service es dueño de su interfaz. No existe `src/app/models/` porque eso
crea dependencias ocultas y viola el principio de encapsulamiento.

### 8. Convención de nombres

| Elemento | Convención | Ejemplo |
|---|---|---|
| JSON file | `<section>.json` | `hero.json` |
| Model interface | `PascalCase` sin sufijo | `HeroContent` |
| Model file | `<section>.model.ts` | `hero.model.ts` |
| Service class | `PascalCase + Service` | `HeroService` |
| Service file | `<section>.service.ts` | `hero.service.ts` |
| Signal de datos | `data` o `<entidad>` | `hero`, `data` |
| Signal de loading | `loading` | `loading` |
| Signal de error | `error` | `error` |

### 9. No mezclar fetch con HttpService en el mismo service

Los feature services nuevos usan `fetch()`. Los domain services legacy usan
`HttpClient`. No convivir ambos en el mismo archivo. La migración completa
es hacia `fetch()` + `signal()`.

### 10. Los JSON de entidad no referencian a otros JSON

No hay imports, no hay referencias, no hay `$ref`. Cada archivo es
autocontenido. La composición ocurre en los services, no en los datos.

---

## Mapa de dependencias

```
                    ┌───────────────────┐
                    │   business.json   │── site.name, contact.schedule,
                    │   (entity)        │── contact.email/phone/address,
                    │                   │── social URLs, seo
                    └────────┬──────────┘
                             │
                             ▼
               domains/business/business.service.ts
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        ContactComponent  PromoComponent  WhatsappBtnComponent
        WhatsappMessageService

                    ┌───────────────────┐
                    │   content.json    │── section headers (title/subtitle),
                    │   (entity)        │── about paragraphs/stats
                    └────────┬──────────┘
                             │
                             ▼
                domains/content/content.service.ts
                             │
              ┌──────────┬───┼───┬──────────┐
              ▼          ▼   ▼   ▼          ▼
        Services   Pricing Gallery  Team   Testimonials
                                              Process

                    ┌───────────────────┐
                    │  navigation.json  │── nav, footerLinks, ctaReservar
                    │  (entity)         │
                    └────────┬──────────┘
                             │
                             ▼
             domains/navigation/navigation.service.ts
                             │
                             ▼
                        NavComponent

                    ┌───────────────────┐
                    │    hero.json      │── tagline, description,
                    │   (section)       │── heroImage, scrollText, etc.
                    └────────┬──────────┘
                             │ fetch
                             ▼
                 services/features/hero/hero.service.ts
                             │
                             ▼
                       HeroComponent

                    ┌───────────────────┐
                    │   header.json     │── logoAriaLabel, menuLabels
                    │   (section)       │
                    └────────┬──────────┘
                             │ fetch
                             ▼
                services/features/header/header.service.ts
                             │
                             ▼
                      HeaderComponent

                    ┌───────────────────┐
                    │   footer.json     │── brandDescription, headings,
                    │   (section)       │── copyrightText
                    └────────┬──────────┘
                             │ fetch
                             ▼
                services/features/footer/footer.service.ts
                             │
                             ▼
                      FooterComponent

                    ┌───────────────────┐
                    │ business-info.json│── paragraphLead, paragraphSecond
                    │   (section)       │
                    └────────┬──────────┘
                             │ fetch
                             ▼
           services/features/business-info/business-info.service.ts
                             │
                             ▼
                       AboutComponent
```

---

## Hoja de ruta

### Pendiente: migrar secciones restantes al nuevo patrón

| Sección | Componente | Services actuales | Prioridad |
|---|---|---|---|
| Services | `features/services/services.ts` | `ServiceService` + `ContentService` | Media |
| Pricing | `features/pricing/pricing.ts` | `ServiceService` + `ContentService` | Media |
| Gallery | `features/gallery/gallery.ts` | `GalleryService` + `ContentService` | Media |
| Team | `features/team/team.ts` | `TeamService` + `ContentService` | Media |
| Testimonials | `features/testimonials/testimonials.ts` | `TestimonialService` + `ContentService` | Media |
| Process | `features/process/process.ts` | `ProcessService` + `ContentService` | Media |
| Promo | `features/promo/promo.ts` | `PromoService` + `BusinessService` | Baja |
| Contact | `features/contact/contact.ts` | `ContactService` + `ServiceService` + `BusinessService` | Baja |

### Pendiente: eliminar duplicación en JSONs de sección

Los siguientes campos están duplicados y deberían migrarse a composición:

| Campo duplicado | Aparece en | Fuente de verdad |
|---|---|---|
| `siteName` / `businessName` | hero.json, header.json, footer.json, business-info.json, content.json, business.json | `business.json` |
| `ctaLabel` / `ctaReservar` | hero.json, business-info.json, navigation.json, content.json | `navigation.json` |
| `schedule` | footer.json, business.json | `business.json` |
| `contactInfo` | footer.json, business.json | `business.json` |
| `socialLinks` | footer.json, business.json | `business.json` |
| `about.*` | business-info.json, content.json | `content.json` |

### Pendiente: eliminar datos huérfanos en content.json

Los campos `hero.*` y `about.*` en content.json ya no los consume ningún
componente. Pueden eliminarse una vez que la migración esté completa.

### Pendiente: eliminar services huérfanos

`services/features/business/business.service.ts` y
`services/features/navigation/navigation.service.ts` no los usa nadie. Se
crearon como parte del nuevo patrón pero nunca se conectaron. Decidir si
completar la migración o eliminarlos.
