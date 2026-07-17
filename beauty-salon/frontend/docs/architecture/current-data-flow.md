# Current Data Flow Architecture

> **Audience**: Frontend developers joining the project.
>
> **Purpose**: Understand how data travels from its source (JSON files) to the pixels the user sees — service by service, domain by domain.
>
> **Date**: 2026-07-16
> **App**: Beauty Salon Angular (Angular 22, standalone components, signals, Tailwind v4)

---

## Table of Contents

1. [Anatomy of a Data Flow](#1-anatomy-of-a-data-flow)
2. [The Two Service Patterns](#2-the-two-service-patterns)
3. [Flow Diagrams per Domain](#3-flow-diagrams-per-domain)
   - [3.1 Content — The God Service](#31-content--the-god-service)
   - [3.2 Business — The Complex One](#32-business--the-complex-one)
   - [3.3 Services — The Catalog](#33-services--the-catalog)
   - [3.4 Team](#34-team)
   - [3.5 Gallery](#35-gallery)
   - [3.6 Testimonials](#36-testimonials)
   - [3.7 Results / Before-After](#37-results--before-after)
   - [3.8 FAQ](#38-faq)
   - [3.9 Process](#39-process)
   - [3.10 Promotions](#310-promotions)
   - [3.11 Navigation](#311-navigation)
   - [3.12 Contact / Booking](#312-contact--booking)
   - [3.13 Header](#313-header)
   - [3.14 Hero](#314-hero)
   - [3.15 Footer](#315-footer)
   - [3.16 About](#316-about)
   - [3.17 Booking CTA](#317-booking-cta)
4. [The Shared Component Layer](#4-the-shared-component-layer)
5. [Complete Dependency Table](#5-complete-dependency-table)
6. [Dead Code & Duplicates](#6-dead-code--duplicates)

---

## 1. Anatomy of a Data Flow

Every data flow in this project follows the same layered structure:

```
┌─────────────────────────────────────────────────────────────────────┐
│                      DATA FLOW — LAYERED VIEW                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   SOURCE                                                            │
│   ┌─────────────────────────────────────┐                           │
│   │  public/assets/data/{domain}.json   │   16 static JSON files    │
│   └──────────────┬──────────────────────┘                           │
│                  │  fetch() or HttpClient.get()                      │
│                  ▼                                                   │
│   SERVICE LAYER                                                      │
│   ┌─────────────────────────────────────┐                           │
│   │  domains/{domain}/{domain}.service  │   Per-domain service      │
│   │  or services/features/{domain}/     │   Owns data + error       │
│   │                                     │                           │
│   │  ├── data = signal() or toSignal()  │   ← Reactivo             │
│   │  ├── loading = signal(true)         │   ← Solo en fetch()      │
│   │  └── error = signal(null)           │      services             │
│   └──────────────┬──────────────────────┘                           │
│                  │  inject(Service)                                    │
│                  ▼                                                   │
│   COMPONENT TS                                                       │
│   ┌─────────────────────────────────────┐                           │
│   │  features/{domain}/{domain}.ts      │   Bridge entre datos      │
│   │                                     │   y presentación          │
│   │  ├── data = toSignal(service.getAll())  ← Observable → Signal  │
│   │  ├── derivedData = computed(() => ...)  ← Derivación reactiva  │
│   │  └── uiState = signal(...)           ← Estado puramente local  │
│   └──────────────┬──────────────────────┘                           │
│                  │  {{ data() }}, [input]="data()"                   │
│                  ▼                                                   │
│   TEMPLATE (.html)                                                   │
│   ┌─────────────────────────────────────┐                           │
│   │  features/{domain}/{domain}.html    │   Renderiza datos         │
│   │                                     │                           │
│   │  ├── @for (item of items(); track)  │   ← Control flow          │
│   │  ├── {{ item.property }}            │   ← Interpolación         │
│   │  └── <app-child [input]="item" />   │   ← Input binding         │
│   └──────────────┬──────────────────────┘                           │
│                  │  @Input()                                            │
│                  ▼                                                   │
│   SHARED COMPONENT (opcional)                                       │
│   ┌─────────────────────────────────────┐                           │
│   │  shared/components/{component}/     │   Puramente presentacional│
│   │                         {component} │   Sin dependencias        │
│   │                                     │   de servicios            │
│   │  ├── @Input() data                  │   ← Recibe datos          │
│   │  └── @Output() action               │   ← Emite eventos         │
│   └─────────────────────────────────────┘                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Key observations about this architecture:

- **Data flows one way**: JSON → Service → Component → Template → Child component
- **Services own the data** (they fetch, cache, and expose it)
- **Components bridge to signals** via `toSignal()` or direct `signal` access
- **Shared components are pure** — they never inject services, only receive `@Input()`
- **No mutations flow backward** — the app is 100% read-only (there is no POST, PUT, DELETE → nothing to "sync")

---

## 2. The Two Service Patterns

Today, **three different patterns** coexist. This is a historical artifact — some services were written with `fetch()` and signals, others with `HttpClient` and Observables.

### Pattern A: `fetch()` + signals (native)

Used by: `HeaderService`, `HeroService`, `FooterService`, `BusinessInfoService`, `FaqService`, and the dead duplicates in `services/features/business/` and `services/features/navigation/`.

```
constructor()
  │
  └── #load()
        │
        ├── await fetch(url)
        ├── this.data.set(json)    → signal
        ├── this.loading.set(false) → signal
        └── this.error.set(msg)    → signal (if error)
```

**Characteristics:**
- ✅ Has `loading` signal (true until fetch resolves)
- ✅ Has `error` signal with string message
- ✅ Data is a direct `signal<T>()` — no observable bridge needed
- ❌ Loads in constructor (eager, no lazy option)
- ❌ No cache mechanism (fetches every time the app loads)
- ❌ No retry or timeout logic

### Pattern B: `HttpClient` + Observable + `toSignal` bridge

Used by: `BusinessService`, `NavigationService`, `ContentService`, `ContactService`

```
readonly data$ = http.get<T>(url).pipe(
  shareReplay(1),
  catchError(() => of(FALLBACK))
);
readonly data = toSignal(this.data$, { initialValue: FALLBACK });
```

**Characteristics:**
- ✅ `shareReplay(1)` acts as in-memory cache
- ✅ Falls back to a `FALLBACK` object instead of undefined
- ✅ Compatible with future `ApiService` (same `HttpClient` base)
- ❌ No `loading` signal (only `error` signal in some services)
- ❌ Two-step bridge (Observable → `toSignal`) adds indirection
- ❌ Error handling relies on a fallback object, never exposes the error

### Pattern C: `HttpClient` + Observable (no signal bridge)

Used by: `ServiceService`, `TeamService`, `GalleryService`, `TestimonialService`, `ResultService`, `ProcessService`, `PromoService`

```
readonly error = signal(false);

getAll(): Observable<T[]> {
  return this.http.get<T[]>(url).pipe(
    shareReplay(1),
    catchError(err => {
      this.error.set(true);
      return of([]);
    }),
  );
}
```

**Characteristics:**
- ✅ Returns `Observable` — the component chooses how to consume it
- ✅ `shareReplay(1)` caches the response
- ❌ No `loading` signal at all
- ❌ Error is `boolean`, not a descriptive string
- ❌ Component must manually call `toSignal()` to make it reactive
- ❌ `PromoService` is a hybrid — also uses `toSignal` + `computed` internally

### Pattern Comparison

| Aspect | Pattern A (fetch+signal) | Pattern B (HttpClient+toSignal) | Pattern C (HttpClient+Observable) |
|--------|------------------------|-------------------------------|-----------------------------------|
| HTTP mechanism | `fetch()` | `HttpClient` | `HttpClient` |
| Data reactivity | `signal<T>` | `toSignal()` → signal | `Observable<T>` |
| Loading state | ✅ `signal(true)` | ❌ (FALLBACK object) | ❌ |
| Error state | `signal<string \| null>` | `signal(false)` or fallback | `signal(bool)` |
| Cache | None | `shareReplay(1)` | `shareReplay(1)` |
| Retry/Timeout | None | None | None |
| Lazy load | ❌ (constructor) | ❌ (constructor or eager) | ✅ (method called by component) |
| Services | 4 active + 2 dead | 4 services | 7 services |

---

## 3. Flow Diagrams per Domain

### 3.1 Content — The God Service

```
┌──────────────────────────────────────────────────────────────────────────┐
│  CONTENT DOMAIN                                                          │
│  public/assets/data/content.json (40 lines)                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │ { hero: {...}, about: {...}, services: {title, subtitle},          │ │
│  │   pricing: {...}, gallery: {...}, team: {...}, testimonials: {...}, │ │
│  │   process: {...}, emptyState: {noResults, noPromotions,             │ │
│  │                               noTestimonials} }                     │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ContentService  (domains/content/content.service.ts)                │ │
│  │  ├── data$ = http.get<ContentData>(url).pipe(shareReplay(1),        │ │
│  │  │              catchError(() => of(FALLBACK)))                       │ │
│  │  └── data = toSignal(data$, { initialValue: FALLBACK })  ← signal   │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       │  this.contentService.data()                                       │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  8 FEATURE COMPONENTS (each reads a different branch)                │ │
│  │                                                                      │ │
│  │  ProcessComponent  → computed: processTitle(), processSubtitle()     │ │
│  │  PromoComponent    → computed: noPromotionsContent()                 │ │
│  │  ServicesComponent → computed: servicesTitle(), servicesSubtitle()   │ │
│  │  PricingComponent  → computed: pricingTitle(), pricingSubtitle()     │ │
│  │  TeamComponent     → computed: teamTitle(), teamSubtitle()           │ │
│  │  GalleryComponent  → computed: galleryTitle(), gallerySubtitle()     │ │
│  │  TestimonialsComponent → computed: testimonialsTitle()               │ │
│  │  FaqComponent      → computed: noResultsContent()                    │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  TEMPLATES                                                           │ │
│  │  <app-section-header [title]="servicesTitle()" ... />                │ │
│  │  <app-empty-state [title]="noPromotionsContent().title" ... />       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

**🐘 Why it's a problem**: This single service is consumed by **8 different components**. It mixes section headers (which could come from each domain's API) with empty state text (which could be static constants) and hero content (which is duplicated in `HeroService`). It's a God Object — a single point of coupling for content that should be distributed.

---

### 3.2 Business — The Complex One

```
┌──────────────────────────────────────────────────────────────────────────┐
│  BUSINESS DOMAIN                                                         │
│  public/assets/data/business/business.json (95 lines)                          │
│  { site: {}, contact: { phone, whatsapp, email, address, social,        │
│    schedule: { regular: [7 BusinessDay], exceptions?: [...] } },        │
│    seo: {} }                                                             │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  BusinessService  (domains/business/business.service.ts)             │ │
│  │                                                                      │ │
│  │  Raw data layer:                                                     │ │
│  │  ├── data = toSignal(data$, { initialValue: FALLBACK })  ← signal   │ │
│  │  │                                                                   │ │
│  │  Derived computed layer (reactivo, recalcula automáticamente):       │ │
│  │  ├── schedule         = computed(() => data().contact.schedule)       │ │
│  │  ├── regularSchedule  = computed(() => schedule().regular)            │ │
│  │  ├── exceptions       = computed(() => schedule().exceptions)         │ │
│  │  ├── businessHours    = computed(() → array of {day, label, hours,   │ │
│  │  │                                        isClosed} con shifts→text) │ │
│  │  ├── todaySchedule    = computed(() → {day, hours, isClosed,         │ │
│  │  │                                        isException, reason})       │ │
│  │  │                       con timezone America/Mexico_City +           │ │
│  │  │                       excepción lookup + fallback a regular        │ │
│  │  └── isOpenNow        = computed(() ⇒ boolean, compara hora actual   │ │
│  │                          contra todaySchedule.shifts)                 │ │
│  │                                                                      │ │
│  │  Methodos:                                                           │ │
│  │  ├── getDaySchedule(day) → BusinessDay | undefined                   │ │
│  │  └── getCurrentTimeCDMX() → string (private)                         │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       │  Inyectado en 4 componentes:                                      │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  CONSUMERS                                                           │ │
│  │                                                                      │ │
│  │  AppComponent                                                        │ │
│  │  ├── waPhone = computed(() => data().contact.whatsapp)               │ │
│  │  └── Template: <app-floating-whatsapp [phone]="waPhone()">           │ │
│  │                                                                      │ │
│  │  FooterComponent                                                     │ │
│  │  ├── businessHours = this.businessService.businessHours  ← computed  │ │
│  │  ├── isOpenNow = this.businessService.isOpenNow        ← computed    │ │
│  │  └── waPhone = computed(() => data().contact.whatsapp)               │ │
│  │      Template: @for (item of businessHours(); track) + schedule-status│ │
│  │                                                                      │ │
│  │  ContactComponent                                                    │ │
│  │  ├── address = computed(() => data().contact.address)                │ │
│  │  ├── phone = computed(() => data().contact.phone.display)            │ │
│  │  ├── email = computed(() => data().contact.email)                    │ │
│  │  ├── businessHours = this.businessService.businessHours              │ │
│  │  ├── isOpenNow = this.businessService.isOpenNow                      │ │
│  │  ├── getDaySchedule(day) (usado en isClosedDay getter)               │ │
│  │  └── exceptions() (usado en isClosedDay getter)                      │ │
│  │                                                                      │ │
│  │  ServicesComponent                                                   │ │
│  │  └── waPhone = computed(() => data().contact.whatsapp)               │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Note**: The `todaySchedule` and `isOpenNow` computed signals encapsulate business logic that **belongs on the backend** — timezone resolution, exception handling, shift comparison. Today it runs entirely in the browser.

---

### 3.3 Services — The Catalog

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SERVICES DOMAIN                                                         │
│  public/assets/data/services/services.json (83 lines, array of 10+ services) │
│  [{ id, name, description, price, durationMinutes, duration, icon,      │
│    category, sortOrder, image?, badges?: [{id, label, priority, color}] │
│  }]                                                                      │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ServiceService  (domains/services/service.service.ts)               │ │
│  │  ├── error = signal(false)                                           │ │
│  │  ├── allServices$ = http.get<Service[]>(url).pipe(shareReplay(1),    │ │
│  │  │                   catchError(...→ of([])))                         │ │
│  │  ├── getAll() → Observable (normalizado: badges sorted, sortOrder)   │ │
│  │  ├── getById(id) → Observable<Service | undefined>                   │ │
│  │  ├── getByCategory(cat) → Observable<Service[]>                      │ │
│  │  ├── getByBadge(badgeId) → Observable<Service[]>                     │ │
│  │  └── getPopular() → Observable<Service[]>                            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       │  getAll() inyectado en 3 componentes:                             │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  CONSUMERS                                                           │ │
│  │                                                                      │ │
│  │  ServicesComponent                                                   │ │
│  │  ├── services = toSignal(serviceService.getAll(), {initialValue:[]}) │ │
│  │  ├── servicesByPriority = computed(() => services sorted by badge)    │ │
│  │  ├── featuredServices = computed(() → services with badges)           │ │
│  │  └── Template:                                                       │ │
│  │      @for (service of services(); track service.id)                  │ │
│  │        <app-service-card                                             │ │
│  │          [id]="service.id"                                           │ │
│  │          [name]="service.name"                                       │ │
│  │          [description]="service.description"                          │ │
│  │          [priceLabel]="'$ ' + service.price.toLocaleString('es-AR')" │ │
│  │          [duration]="service.duration"                                │ │
│  │          [icon]="service.icon"                                        │ │
│  │          [image]="service.image"                                      │ │
│  │          [badges]="service.badges ?? []"                              │ │
│  │          buttonLabel="Reservar"                                       │ │
│  │          (action)="onAction($event)" />                               │ │
│  │                                                                      │ │
│  │  PricingComponent                                                     │ │
│  │  ├── services = toSignal(serviceService.getAll(), {initialValue:[]}) │ │
│  │  └── Template:                                                       │ │
│  │      @for (service of services(); track service.id)                  │ │
│  │        <tr><td>{{ service.name }}</td>                               │ │
│  │            <td>{{ service.duration }}</td>                            │ │
│  │            <td>${{ service.price }}</td></tr>                         │ │
│  │                                                                      │ │
│  │  ContactComponent (wizard step 1, service selection)                  │ │
│  │  ├── services = toSignal(serviceService.getAll(), {initialValue:[]}) │ │
│  │  └── Template:                                                       │ │
│  │      @for (s of services(); track s.id)                               │ │
│  │        <app-service-option-card                                       │ │
│  │          [value]="s.id"                                              │ │
│  │          [name]="s.name"                                             │ │
│  │          [duration]="s.duration"                                      │ │
│  │          [priceLabel]="'$ ' + s.price.toLocaleString('es-AR')"       │ │
│  │          [isSelected]="selectedServiceId === s.id"                    │ │
│  │          (selected)="selectService($event)" />                        │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Note**: `ServicesComponent` does NOT use `servicesByPriority()` in its template — it iterates over `services()`. The sorted version is computed but unused in the template. Likely a leftover from a previous iteration.

---

### 3.4 Team

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TEAM DOMAIN                                                             │
│  public/assets/data/team/team.json (38 lines, array of team members)          │
│  [{ id, name, role, photo?, bio, experience, social: {instagram?        │
│    facebook?, whatsapp?} }]                                               │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  TeamService  (domains/team/team.service.ts)                         │ │
│  │  ├── error = signal(false)                                           │ │
│  │  ├── allMembers$ = http.get<TeamMember[]>(url).pipe(shareReplay(1),  │ │
│  │  │                 catchError(...→ of([])))                            │ │
│  │  ├── getAll() → Observable<TeamMember[]>                             │ │
│  │  └── getById(id) → Observable<TeamMember | undefined>                │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  TeamComponent                                                       │ │
│  │  ├── team = toSignal(teamService.getAll(), { initialValue: [] })     │ │
│  │  └── Template:                                                       │ │
│  │      @for (member of team(); track member.id)                        │ │
│  │        <!-- No child component — rendered inline -->                 │ │
│  │        <article class="card-lift">                                   │ │
│  │          <img [src]="member.photo" [alt]="member.name" ... />        │ │
│  │          <h3>{{ member.name }}</h3>                                  │ │
│  │          <p>{{ member.role }}</p>                                    │ │
│  │          <p>{{ member.experience }} de experiencia</p>                │ │
│  │          <p>{{ member.bio }}</p>                                     │ │
│  │          @if (member.social.instagram) { <a ...> }                   │ │
│  │        </article>                                                     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 3.5 Gallery

```
┌──────────────────────────────────────────────────────────────────────────┐
│  GALLERY DOMAIN                                                          │
│  public/assets/data/gallery/gallery.json (58 lines, array of gallery items)  │
│  [{ src, alt, width?, height?, category? }]                              │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  GalleryService  (domains/gallery/gallery.service.ts)                │ │
│  │  ├── error = signal(false)                                           │ │
│  │  ├── allImages$ = http.get<GalleryItem[]>(url).pipe(shareReplay(1), │ │
│  │  │                catchError(...→ of([])))                            │ │
│  │  ├── getAll() → Observable<GalleryItem[]>                            │ │
│  │  └── getByCategory(cat) → Observable<GalleryItem[]>                 │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  GalleryComponent                                                    │ │
│  │  ├── images = toSignal(galleryService.getAll(), { initialValue: [] })│ │
│  │  ├── selectedIndex = signal(-1)  ← local UI state                    │ │
│  │  └── Template:                                                       │ │
│  │      <app-gallery-grid [images]="images()"                           │ │
│  │                        (imageClicked)="onImageClicked($event)" />    │ │
│  │      <app-lightbox [images]="images()"                               │ │
│  │                    [selectedIndex]="selectedIndex()"                  │ │
│  │                    (close)="selectedIndex.set(-1)"                    │ │
│  │                    (indexChange)="selectedIndex.set($event)" />       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Shared components consumed:                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  GalleryGridComponent (shared)                                       │ │
│  │  ├── @Input() images: GalleryImage[]                                 │ │
│  │  └── @Output() imageClicked: GalleryImage                            │ │
│  │                                                                      │ │
│  │  LightboxComponent (shared)                                          │ │
│  │  ├── @Input() images: GalleryImage[]                                 │ │
│  │  ├── @Input() selectedIndex: number                                  │ │
│  │  ├── @Output() close: void                                           │ │
│  │  ├── @Output() indexChange: number                                   │ │
│  │  └── Local state: zoomScale, panX, panY, isDragging (signals)        │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Design note**: `GalleryImage` is defined and exported from `shared/components/gallery-grid/gallery-grid.ts`, NOT from the Gallery domain model. It's a presentation model that happens to mirror the JSON structure. This couples the shared component to the JSON shape.

---

### 3.6 Testimonials

```
┌──────────────────────────────────────────────────────────────────────────┐
│  TESTIMONIALS DOMAIN                                                     │
│  public/assets/data/testimonials/testimonials.json (56 lines, array)          │
│  [{ id, name, photo, text, rating, service, date }]                      │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  TestimonialService (domains/testimonials/testimonial.service.ts)    │ │
│  │  ├── error = signal(false)                                           │ │
│  │  └── getAll() → Observable<Testimonial[]>                            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  TestimonialsComponent                                               │ │
│  │  ├── testimonials = toSignal(testimonialService.getAll(),            │ │
│  │  │                    { initialValue: [] })                           │ │
│  │  ├── carousel = new CarouselController(...)  ← signals-based         │ │
│  │  ├── currentTestimonial = computed(() =>                             │ │
│  │  │   testimonials()[carousel.currentIndex()])                         │ │
│  │  └── Template:                                                       │ │
│  │      @if (!testimonials().length)                                     │ │
│  │        <app-empty-state ... />                                        │ │
│  │      @else                                                            │ │
│  │        <app-carousel [controller]="carousel"                         │ │
│  │                      [totalItems]="testimonials().length" ... >      │ │
│  │          @for (item of testimonials(); track item.id)                 │ │
│  │            <app-testimonial-card                                      │ │
│  │              [name]="item.name"                                      │ │
│  │              [photo]="item.photo"                                     │ │
│  │              [text]="item.text"                                       │ │
│  │              [rating]="item.rating"                                   │ │
│  │              [service]="item.service" />                               │ │
│  │        </app-carousel>                                                │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Note**: `currentTestimonial` is computed but never used in the template. The carousel handles which slide is visible. This might be a future-use signal or leftover.

---

### 3.7 Results / Before-After

```
┌──────────────────────────────────────────────────────────────────────────┐
│  RESULTS DOMAIN                                                          │
│  public/assets/data/results/before-after.json (82 lines, array of Results)   │
│  [{ id, title, description, beforeImage, afterImage, category, featured │
│    order }]                                                              │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ResultService  (domains/results/result.service.ts)                  │ │
│  │  ├── error = signal(false)                                           │ │
│  │  ├── allResults$ = http.get<Result[]>(url).pipe(shareReplay(1),     │ │
│  │  │                catchError(...→ of([])))                            │ │
│  │  ├── getAll() → Observable (sorted by order)                         │ │
│  │  ├── getById(id) → Observable<Result | undefined>                    │ │
│  │  ├── getFeatured() → Observable<Result[]>                            │ │
│  │  └── getByCategory(cat) → Observable<Result[]>                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ResultsComponent                                                    │ │
│  │  ├── results = toSignal(resultService.getAll(), { initialValue: [] })│ │
│  │  ├── carousel = new CarouselController({totalItems, autoPlay, ...})  │ │
│  │  ├── currentResult = computed(() → results()[carousel.currentIndex]) │ │
│  │  ├── animateTrack = signal(true)   ← local UI state                  │ │
│  │  ├── isZoomActive = signal(false)  ← local UI state                  │ │
│  │  ├── eagerIndices = computed(→ Set de índices adyacentes al activo) │ │
│  │  └── Template:                                                       │ │
│  │      <app-carousel [controller]="carousel"                           │ │
│  │                    [animateTrack]="animateTrack()"                    │ │
│  │                    [zoomActive]="isZoomActive()" ... >               │ │
│  │        @for (item of results(); track item.id)                       │ │
│  │          <app-image-compare                                           │ │
│  │            [before]="{ image: item.beforeImage, label: 'Antes' }"    │ │
│  │            [after]="{ image: item.afterImage, label: 'Después' }"    │ │
│  │            [alt]="item.title"                                        │ │
│  │            [active]="i === carousel.currentIndex()"                  │ │
│  │            [resetKey]="carousel.currentIndex()"                      │ │
│  │            (swipe)="onSwipe($event)"                                 │ │
│  │            (zoomChange)="onZoomChange($event)" />                    │ │
│  │          <!-- item.title, item.description rendered inline -->       │ │
│  │      </app-carousel>                                                  │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Note**: The section header ("Antes y Después" / subtitle) is **hardcoded** in the template — not from ContentService. Inconsistent with all other features.

---

### 3.8 FAQ

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FAQ DOMAIN                                                              │
│  public/assets/data/faq/faq.json (114 lines, array of FAQ items)             │
│  [{ id, question, answer, category, order, featured }]                   │
│       │                                                                   │
│       │ fetch() in constructor                                            │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  FaqService  (domains/faq/faq.service.ts)                           │ │
│  │  ├── faqs = signal<FaqItem[]>([])          ← fetched in constructor  │ │
│  │  ├── faqsOrdenadas = computed(() → sorted by order)                  │ │
│  │  ├── categorias = computed(() → [...new Set(faqs.map(category))])   │ │
│  │  ├── loading = signal(true)                                          │ │
│  │  └── error = signal<string | null>(null)                             │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  FaqComponent                                                        │ │
│  │  ├── categorias = this.service.categorias       ← computed           │ │
│  │  ├── faqs = computed(() → this.service.faqsOrdenadas())              │ │
│  │  ├── searchText = signal('')                   ← local UI state      │ │
│  │  ├── categoriaSeleccionada = signal(null)       ← local UI state      │ │
│  │  ├── faqAbierta = signal(null)                 ← local UI state      │ │
│  │  ├── hayResultados = computed(() → filtered faqs not empty)          │ │
│  │  ├── coincideConFiltro(item) → boolean (searchText + category)       │ │
│  │  └── Template:                                                       │ │
│  │      <input type="search" [value]="searchText()"                      │ │
│  │             (input)="searchText.set($event.target.value)" />          │ │
│  │      @for (cat of categorias(); track cat)                            │ │
│  │        <button (click)="seleccionar(cat)">{{ cat }}</button>          │ │
│  │      @if (!hayResultados() && searchText())                           │ │
│  │        <app-empty-state ... />                                        │ │
│  │      @for (item of faqs(); track item.id)                             │ │
│  │        <app-faq-item                                                  │ │
│  │          [id]="item.id"                                              │ │
│  │          [question]="item.question"                                   │ │
│  │          [answer]="item.answer"                                       │ │
│  │          [open]="faqAbierta() === item.id"                            │ │
│  │          (toggle)="toggleFaq(item.id)" />                             │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Note**: `FaqService` is the only domain service that uses `fetch()` instead of `HttpClient`. It's also the only one that loads in the constructor (like the feature services, not like the other domain services). This is an inconsistency — it has the data pattern of `services/features/*` but lives in `domains/`.

---

### 3.9 Process

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PROCESS DOMAIN                                                          │
│  public/assets/data/process/process.json (30 lines, array of 3 steps)         │
│  [{ number, icon, title, description, image }]                          │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ProcessService  (domains/process/process.service.ts)                │ │
│  │  ├── error = signal(false)                                           │ │
│  │  └── getAll() → Observable<ProcessStep[]>                            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ProcessComponent                                                    │ │
│  │  ├── steps = toSignal(processService.getAll(), { initialValue: [] }) │ │
│  │  └── Template:                                                       │ │
│  │      @for (step of steps(); track step.number)                        │ │
│  │        <!-- No child component — rendered inline -->                 │ │
│  │        <img [src]="step.image" ... />                                 │ │
│  │        <app-svg-icon [name]="step.icon" ... />                        │ │
│  │        <h3>{{ step.title }}</h3>                                      │ │
│  │        <p>{{ step.description }}</p>                                  │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 3.10 Promotions

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PROMOTIONS DOMAIN                                                       │
│  public/assets/data/promotions/promotions.json (62 lines, array)              │
│  [{ id, title, subtitle?, description, image, buttonLabel, buttonUrl,   │
│    startDate, endDate, priority, status, badge?, theme? }]               │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  PromoService  (domains/promotions/promotion.service.ts)             │ │
│  │  ├── error = signal(false)                                           │ │
│  │  ├── promo$ = http.get<Promotion[]>(url).pipe(shareReplay(1),       │ │
│  │  │             catchError(...→ of([])))                                │ │
│  │  ├── #promos = toSignal(promo$, { initialValue: [] })   ← signal    │ │
│  │  ├── activePromotions = computed(() → filter isPromocionVigente()   │ │
│  │  │                              + sort by priority desc)             │ │
│  │  ├── currentPromotion = computed(() → activePromotions[0] ?? null)  │ │
│  │  └── getCurrent() → Observable (legacy bridge for compat)            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  PromoComponent                                                      │ │
│  │  ├── currentPromotion = this.promoService.currentPromotion ← computed│ │
│  │  ├── promoList = computed(() → currentPromotion() ? [p] : [])       │ │
│  │  ├── noPromotionsContent = computed(...)                             │ │
│  │  └── Template:                                                       │ │
│  │      @if (error) <app-error-boundary ... />                          │ │
│  │      @else if (!promoList().length) <app-empty-state ... />          │ │
│  │      @for (promo of promoList(); track promo.id)                     │ │
│  │        <!-- Inline rendering: title, subtitle, description,          │ │
│  │             app-badge, app-cta-button -->                             │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Key logic**: `isPromocionVigente()` is a **pure function** in `promotion.model.ts` that checks `status === 'active'` and `startDate <= today && endDate >= today` with `America/Mexico_City` timezone. This is business logic that should ideally run on the backend.

---

### 3.11 Navigation

```
┌──────────────────────────────────────────────────────────────────────────┐
│  NAVIGATION DOMAIN                                                       │
│  public/assets/data/navigation/navigation.json (16 lines)                     │
│  { nav: [{label, fragment}], footerLinks: [{label, fragment}],          │
│    ctaReservar: string }                                                  │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  NavigationService  (domains/navigation/navigation.service.ts)       │ │
│  │  ├── data$ = http.get<NavigationData>(url).pipe(shareReplay(1),     │ │
│  │  │             catchError(...→ of(FALLBACK_NAV)))                     │ │
│  │  ├── data = toSignal(data$, { initialValue: FALLBACK_NAV })           │ │
│  │  ├── nav = () => data().nav                    ← accessor method     │ │
│  │  ├── footerLinks = () => data().footerLinks    ← accessor method     │ │
│  │  └── ctaReservar = () => data().ctaReservar    ← accessor method     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  NavComponent  (domains/navigation/nav.ts)                           │ │
│  │  ├── items = computed(() → navigationService.data().nav)              │ │
│  │  ├── ctaReservar = computed(() → navigationService.data().ctaReservar)│ │
│  │  ├── isOpen = input(false)    ← desde HeaderComponent                │ │
│  │  ├── isScrolled = input(false) ← desde HeaderComponent               │ │
│  │  └── Template:                                                       │ │
│  │      @for (item of items(); track item.fragment)                     │ │
│  │        <a href="#{{ item.fragment }}">{{ item.label }}</a>            │ │
│  │      {{ ctaReservar() }}                                              │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Note**: The `nav`, `footerLinks`, and `ctaReservar` accessors are functions (`() => signal()`), not computed signals. This means they create a new reading context on every call but don't cache a computed dependency graph. The `NavComponent` re-reads them via `computed(() → service.data().nav)` anyway.

---

### 3.12 Contact / Booking

```
┌──────────────────────────────────────────────────────────────────────────┐
│  CONTACT DOMAIN                                                          │
│  public/assets/data/contact/contact.json (9 lines)                            │
│  { title, subtitle, wizardSteps: string[4],                              │
│    timeSlots: { morning: string[], afternoon: string[] } }                │
│       │                                                                   │
│       │ HttpClient.get()                                                  │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ContactService  (domains/contact/contact.service.ts)                │ │
│  │  └── config = toSignal(config$, { initialValue: FALLBACK })          │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│  Also consumes:                                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  WhatsappMessageService (domains/booking/services/)                   │ │
│  │  ├── buildText(params) → string (formatteo del mensaje)               │ │
│  │  └── buildUrl(params) → string (whatsapp:// deeplink)                 │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                           │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  ContactComponent  (features/contact/contact.ts — 238 lines)         │ │
│  │                                                                      │ │
│  │  Inyecta 6 dependencias:                                             │ │
│  │  ├── ServiceService      → services (toSignal)                        │ │
│  │  ├── ContactService      → config (toSignal → computed extracts)      │ │
│  │  ├── BusinessService     → address, phone, email, businessHours,     │ │
│  │  │                          isOpenNow, exceptions, getDaySchedule()  │ │
│  │  ├── WhatsappMessageService → buildUrl(), buildText()                 │ │
│  │  └── ElementRef          → DOM focus management                       │ │
│  │                                                                      │ │
│  │  ⚠️ Wizard state uses PLAIN PROPERTIES (not signals):                │ │
│  │  step, submitted, attemptedSubmit, popupBlocked,                     │ │
│  │  selectedServiceId, selectedDate, selectedTime,                      │ │
│  │  name, clientPhone, notes                                            │ │
│  │                                                                      │ │
│  │  ⚠️ Uses getters instead of computed:                                 │ │
│  │  get canGoNext(), get isLastStep(), get isClosedDay(),               │ │
│  │  get minDate(), get selectedService(), get waUrl()                   │ │
│  │                                                                      │ │
│  │  Template: 4-step wizard + sidebar with BusinessService data          │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **This is the most complex component in the project.** It inyecta 6 servicios, maneja un wizard de 4 pasos, y mezcla signals con propiedades planas. El wizard state debería migrarse a signals para consistencia con el resto del proyecto.

---

### 3.13 Header

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HEADER — Feature Service                                                │
│  public/assets/data/header/header.json (7 lines)                              │
│  { siteName, logoAriaLabel, menuAriaLabel, menuOpenLabel,               │
│    menuCloseLabel }                                                       │
│       │                                                                   │
│       │ fetch() in constructor                                            │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  HeaderService  (services/features/header/header.service.ts)         │ │
│  │  ├── data = signal<HeaderData>(FALLBACK)                             │ │
│  │  ├── loading = signal(true)                                          │ │
│  │  └── error = signal<string | null>(null)                             │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  HeaderComponent  (layout/header/header.ts)                          │ │
│  │  ├── data = this.headerService.data    ← signal                      │ │
│  │  ├── isMenuOpen = signal(false)        ← local UI state              │ │
│  │  ├── isScrolled = signal(false)        ← local UI state              │ │
│  │  └── Template:                                                       │ │
│  │      {{ data().siteName }}                                           │ │
│  │      {{ data().menuOpenLabel }} / {{ data().menuCloseLabel }}        │ │
│  │      <app-nav [isOpen]="isMenuOpen()" [isScrolled]="isScrolled()"   │ │
│  │               (navigated)="closeMenu()" />                            │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 3.14 Hero

```
┌──────────────────────────────────────────────────────────────────────────┐
│  HERO — Feature Service                                                  │
│  public/assets/data/hero/hero.json (10 lines)                                  │
│  { businessName, tagline, description, ctaLabel, ctaSecondaryLabel,      │
│    heroImage, scrollText, ariaLabel }                                     │
│       │                                                                   │
│       │ fetch() in constructor                                            │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  HeroService  (services/features/hero/hero.service.ts)               │ │
│  │  ├── hero = signal<HeroContent>(FALLBACK)                            │ │
│  │  ├── loading = signal(true)                                          │ │
│  │  └── error = signal<string | null>(null)                             │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  HeroComponent  (domains/content/hero/hero.ts)                       │ │
│  │  ├── content = this.heroService.hero    ← signal                     │ │
│  │  └── Template:                                                       │ │
│  │      {{ content().businessName }}                                    │ │
│  │      {{ content().tagline }}                                         │ │
│  │      {{ content().description }}                                     │ │
│  │      {{ content().ctaLabel }} / {{ content().ctaSecondaryLabel }}    │ │
│  │      {{ content().scrollText }}                                      │ │
│  │      <img [ngSrc]="content().heroImage" ... />                       │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

> **Note**: `HeroContent` is **duplicated** — defined in both `services/features/hero/hero.model.ts` AND `domains/content/content.model.ts`. The two types have different shapes (hero.model has `heroImage`, `scrollText`, `ariaLabel`; content.model has only `businessName`, `tagline`, `description`, `ctaLabel`, `ctaSecondaryLabel`).

---

### 3.15 Footer

```
┌──────────────────────────────────────────────────────────────────────────┐
│  FOOTER — Feature Service                                                │
│  public/assets/data/footer/footer.json (27 lines)                             │
│  { siteName, brandDescription, headings, socialLinks, quickLinks,        │
│    contactInfo, copyrightText }                                           │
│       │                                                                   │
│       │ fetch() in constructor                                            │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  FooterService  (services/features/footer/footer.service.ts)         │ │
│  │  ├── data = signal<FooterData>(FALLBACK)                             │ │
│  │  ├── loading = signal(true)                                          │ │
│  │  └── error = signal<string | null>(null)                             │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  FooterComponent  (layout/footer/footer.ts)                          │ │
│  │  ├── data = this.footerService.data                 ← signal         │ │
│  │  ├── businessHours = this.businessService.businessHours  ← computed  │ │
│  │  ├── isOpenNow = this.businessService.isOpenNow        ← computed    │ │
│  │  ├── waPhone = computed(() → businessService.data().contact.whatsapp)│ │
│  │  ├── year = this.footerService.year                    ← number      │ │
│  │  └── Template:                                                       │ │
│  │      {{ data().siteName }} {{ data().brandDescription }}              │ │
│  │      @for (link of data().socialLinks) → inline SVG icons            │ │
│  │      @for (link of data().quickLinks) → <a> links                    │ │
│  │      @for (item of businessHours()) → schedule table                 │ │
│  │      {{ data().contactInfo.address }} / phone / email                │ │
│  │      <app-whatsapp-button [phone]="waPhone()" />                     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 3.16 About

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ABOUT — Feature Service                                                 │
│  public/assets/data/business-info/business-info.json (15 lines)               │
│  { siteName, title, subtitle, image, imageAlt, paragraphLead,           │
│    paragraphSecond, stats: [{value, label}], ctaLabel }                   │
│       │                                                                   │
│       │ fetch() in constructor                                            │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  BusinessInfoService  (services/features/business-info/)             │ │
│  │  ├── data = signal<BusinessInfoData>(FALLBACK)                       │ │
│  │  ├── loading = signal(true)                                          │ │
│  │  └── error = signal<string | null>(null)                             │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│       │                                                                   │
│       ▼                                                                   │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  AboutComponent  (features/about/about.ts)                           │ │
│  │  ├── data = this.businessInfoService.data    ← signal                │ │
│  │  └── Template:                                                       │ │
│  │      {{ data().siteName }} {{ data().title }} {{ data().subtitle }}  │ │
│  │      {{ data().paragraphLead }} {{ data().paragraphSecond }}          │ │
│  │      @for (stat of data().stats) → {{ stat.value }} {{ stat.label }} │ │
│  │      <app-cta-button [label]="data().ctaLabel" ... />                │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

### 3.17 Booking CTA

```
┌──────────────────────────────────────────────────────────────────────────┐
│  BOOKING CTA — No Data Service                                           │
│                                                                          │
│  BookingCtaComponent  (features/booking-cta/booking-cta.ts)              │
│  ├── No services injected                                                │
│  ├── onBook() → scrolls to #contacto                                    │
│  └── Template:                                                           │
│      <img src="images/booking-cta-1400x600.webp" ... />                 │
│      <h2>Reserva tu turno</h2>  (hardcoded)                              │
│      <p>Elige el día...</p>      (hardcoded)                             │
│      <app-cta-button label="Pedir turno" (clicked)="onBook()" />        │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. The Shared Component Layer

All **24 shared components** are 100% pure — they never inject services, never fetch data, never manage domain state.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  SHARED COMPONENTS — DATA-FREE ZONE                                      │
│                                                                          │
│  These components ONLY receive data via @Input() and emit via @Output(): │
│                                                                          │
│  Badge, Card, Carousel, Container, CtaButton, EmptyState,                │
│  ErrorBoundary, FaqItem, FloatingWhatsapp, FormField, GalleryGrid,       │
│  ImageCompare, Lightbox, Loading, Modal, SectionHeader, ServiceCard,     │
│  ServiceOptionCard, SvgIcon, TestimonialCard, Tooltip, WhatsappButton    │
│                                                                          │
│  They also consume from shared/ (not from domains/):                     │
│  ├── shared/types/        — Badge, Icon, Button, Loading type unions     │
│  ├── shared/directives/   — RevealDirective, CardTiltDirective,         │
│  │                           SwipeDirective                              │
│  ├── shared/pipes/        — DurationPipe, TruncatePipe, PhonePipe       │
│  ├── shared/utils/        — CarouselController, SliderController        │
│  └── shared/tokens/       — SITE_CONFIG, WHATSAPP_NUMBER                │
│                                                                          │
│  Data flows INTO shared components. It never flows out.                  │
└──────────────────────────────────────────────────────────────────────────┘
```

**Exception**: `WhatsappButton` previously injected `BusinessService` but was refactored to receive `phone` as `@Input()`. `ServiceCard` and `TestimonialCard` still import domain model types for their inputs, but don't inject services.

---

## 5. Complete Dependency Table

| # | Domain | JSON Source | Service | Pattern | Consuming Components | Loading | Error | Shared Children |
|---|--------|------------|---------|---------|---------------------|---------|-------|-----------------|
| 1 | **Content** | `content.json` | `ContentService` (domains) | B (HttpClient+toSignal) | Process, Promo, Services, Pricing, Team, Gallery, Testimonials, Faq | ❌ | Fallback object | `SectionHeader`, `EmptyState` |
| 2 | **Business** | `business.json` | `BusinessService` (domains) | B (HttpClient+toSignal) | App, Footer, Contact, Services | ❌ | Fallback object | `FloatingWhatsapp`, `WhatsappButton` |
| 3 | **Services** | `services.json` | `ServiceService` (domains) | C (HttpClient+Observable) | Services, Pricing, Contact | ❌ | `signal(false)` | `ServiceCard`, `ServiceOptionCard` |
| 4 | **Team** | `team.json` | `TeamService` (domains) | C (HttpClient+Observable) | Team | ❌ | `signal(false)` | — (inline render) |
| 5 | **Gallery** | `gallery.json` | `GalleryService` (domains) | C (HttpClient+Observable) | Gallery | ❌ | `signal(false)` | `GalleryGrid`, `Lightbox` |
| 6 | **Testimonials** | `testimonials.json` | `TestimonialService` (domains) | C (HttpClient+Observable) | Testimonials | ❌ | `signal(false)` | `Carousel`, `TestimonialCard`, `EmptyState` |
| 7 | **Results** | `before-after.json` | `ResultService` (domains) | C (HttpClient+Observable) | Results | ❌ | `signal(false)` | `Carousel`, `ImageCompare` |
| 8 | **FAQ** | `faq.json` | `FaqService` (domains) | A (fetch+signal) | Faq | ✅ `signal(true)` | `signal(string)` | `FaqItem`, `EmptyState` |
| 9 | **Process** | `process.json` | `ProcessService` (domains) | C (HttpClient+Observable) | Process | ❌ | `signal(false)` | `SvgIcon` (inline render) |
| 10 | **Promotions** | `promotions.json` | `PromoService` (domains) | B/C hybrid (HttpClient+toSignal+computed) | Promo | ❌ | `signal(false)` | `Badge`, `CtaButton`, `EmptyState` |
| 11 | **Navigation** | `navigation.json` | `NavigationService` (domains) | B (HttpClient+toSignal) | Nav | ❌ | Fallback object | — |
| 12 | **Contact** | `contact.json` | `ContactService` (domains) | B (HttpClient+toSignal) | Contact | ❌ | Fallback object | `FormField`, `ServiceOptionCard`, `SvgIcon` |
| 13 | **Header** | `header.json` | `HeaderService` (features) | A (fetch+signal) | Header | ✅ `signal(true)` | `signal(string)` | `Nav` |
| 14 | **Hero** | `hero.json` | `HeroService` (features) | A (fetch+signal) | Hero | ✅ `signal(true)` | `signal(string)` | — (inline render) |
| 15 | **Footer** | `footer.json` | `FooterService` (features) | A (fetch+signal) | Footer | ✅ `signal(true)` | `signal(string)` | `WhatsappButton` |
| 16 | **About** | `business-info.json` | `BusinessInfoService` (features) | A (fetch+signal) | About | ✅ `signal(true)` | `signal(string)` | `CtaButton` |
| 17 | **Booking CTA** | *(none)* | *(none)* | — | BookingCta | ❌ | ❌ | `CtaButton` |

**Total**: **16 JSON files → 16 services → 14 feature components + 3 layout/domain components + 1 app component = 18 consumers**

---

## 6. Dead Code & Duplicates

### Services not consumed by any component

| Service | Path | Reason |
|---------|------|--------|
| `BusinessService` (v2) | `services/features/business/business.service.ts` | Migration attempt abandoned. Uses `fetch()` + signals with rich `computed` sub-accessors but nobody imports it. |
| `NavigationService` (v2) | `services/features/navigation/navigation.service.ts` | Migration attempt abandoned. Uses `fetch()` + signals. The `domains/navigation/` version is the one in use. |
| `HttpService` | `services/data/http.service.ts` | Scaffolding — never wired into any consumer. Has retry+timeout logic that was a prototype for `ApiService`. |
| `CacheService` | `services/data/cache.service.ts` | Scaffolding — TTL-based in-memory cache, never connected to any data flow. |
| `StorageService` | `services/data/storage.service.ts` | `localStorage` wrapper — defined but never injected. |
| `WindowService` | `services/shared/window.service.ts` | Window abstraction — never injected. |
| `ScrollService` | `services/shared/scroll.service.ts` | Scroll management — never injected. |
| `DateService` | `services/shared/date.service.ts` | Date formatting — never injected. |

### Duplicated models

| Model | Location 1 | Location 2 | Conflict |
|-------|-----------|-----------|----------|
| `HeroContent` | `domains/content/content.model.ts` (7 fields) | `services/features/hero/hero.model.ts` (9 fields, has `heroImage`, `scrollText`, `ariaLabel`) | ❌ Different shapes — the content.model version has fewer fields |
| `NavigationData` | Inline in `domains/navigation/navigation.service.ts` | Inline in `services/features/navigation/navigation.service.ts` | ⚠️ Slightly different fallback values |
| `BusinessConfig` | `domains/business/business.model.ts` | `services/features/business/business.service.ts` (inline FALLBACK) | ✅ Same shape, but the features version re-imports the domain model |

### Computed signals defined but unused in templates

| Component | Computed | Not used in template? |
|-----------|----------|----------------------|
| `ServicesComponent` | `servicesByPriority` | Yes — iterates over `services()`, not `servicesByPriority()` |
| `ServicesComponent` | `featuredServices` | Yes — not bound in template |
| `TestimonialsComponent` | `currentTestimonial` | Yes — carousel handles active slide |
| `ResultsComponent` | `currentResult` | Yes — carousel + `carousel.currentIndex()` handles it |

---

## Architecture at a Glance

```
                     ┌──────────────────────────┐
                     │   16 JSON files           │
                     │   public/assets/data/     │
                     └────────┬─────────────────┘
                              │
              ┌───────────────┼───────────────────┐
              │               │                   │
         fetch()        HttpClient.get()     HttpClient.get()
              │               │                   │
              ▼               ▼                   ▼
     ┌────────────────┐ ┌──────────────┐ ┌──────────────────┐
     │ Pattern A      │ │ Pattern B    │ │ Pattern C        │
     │ 5 active +     │ │ 4 services   │ │ 7 services       │
     │ 2 dead services│ │              │ │                  │
     └───────┬────────┘ └──────┬───────┘ └────────┬─────────┘
             │                 │                  │
             │          toSignal()          toSignal() in
             │                 │             each component
             ▼                 ▼                  ▼
     ┌─────────────────────────────────────────────────────┐
     │                  14 FEATURE COMPONENTS               │
     │  + 3 DOMAIN COMPONENTS (Nav, Hero)                   │
     │  + 1 APP COMPONENT                                    │
     │                                                      │
     │  Each injects 1–6 services, bridges to signals,     │
     │  derives with computed()                             │
     └──────────────────────────┬──────────────────────────┘
                                │
                                │ @Input()
                                ▼
     ┌─────────────────────────────────────────────────────┐
     │               24 SHARED COMPONENTS                   │
     │  100% pure — no services, only inputs/outputs       │
     │  Badge, Card, Carousel, Container, CtaButton, ...   │
     └─────────────────────────────────────────────────────┘
```

---

## Key Takeaways

### What works well
1. **Data flows one way** — JSON → Service → Component → Child component. Simple to trace.
2. **Shared components are pure** — no hidden data dependencies, easy to test and reuse.
3. **Services are injectable** — components depend on abstractions, not concrete file paths.
4. **`readonly` on all models** — immutability is enforced at the type level.

### What needs improvement
1. **Three patterns coexisting** — fetch, HttpClient+toSignal, and HttpClient+Observable make the codebase harder to reason about than necessary.
2. **ContentService is a God Object** — 8 components depend on a single service for text that should either be static constants or come from each domain's API.
3. **No loading state in 7 HttpClient services** — Components can't show spinners during data fetch.
4. **ContactComponent uses plain properties** for wizard state instead of signals — breaks if the component uses `OnPush` change detection.
5. **Dead scaffolding** — 8 services in `public/assets/data/`, `services/shared/`, and `services/features/` are defined but never injected.
6. **ContentService and HeroService have overlapping models** — `HeroContent` is defined in two places with different shapes.
7. **No refresh mechanism** — Data loads once and is never invalidated or refreshed.

### What to do next
The project is ready for a **Repository layer** that sits between services and the HTTP layer. This would:
- Unify the 3 patterns into 1 (HttpClient + signals)
- Add loading state consistently
- Centralize error handling
- Provide a single seam to swap JSON URLs for REST endpoints when the backend arrives

---

*Document generated from source analysis on 2026-07-16. For questions, contact the project lead.*
