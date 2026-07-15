# Promotion — Flujo de datos

> Cómo viaja el dato desde `promotions.json` hasta el template del componente,
> pasando por servicios, signals y computeds.

---

## Pipeline completo

```
public/assets/data/promotions/promotions.json
  │
  │ HttpClient.get<Promotion[]>()
  ▼
PromoService.promo$
  │
  │ toSignal()
  ▼
PromoService.#promos        (private signal<Promotion[]>)
  │
  │ .filter(isPromocionVigente)
  │ .sort(priority DESC)
  ▼
PromoService.activePromotions  (computed<Promotion[]>)
  │
  │ [0] ?? null
  ▼
PromoService.currentPromotion  (computed<Promotion | null>)
  │
  │ inyectado como referencia directa
  ▼
PromoComponent.currentPromotion (señal pública)
  │
  │ .filter(Boolean) → [p] | []
  ▼
PromoComponent.promoList       (computed<Promotion[]>)
  │
  │ @for (promo of promoList(); track promo.id)
  ▼
promo.html (template)
```

---

## Archivos involucrados

| Archivo | Rol |
|---|---|
| `public/assets/data/promotions/promotions.json` | Fuente de datos. Array de objetos `Promotion`. |
| `domains/promotions/promotion.model.ts` | Tipos `Promotion`, `PromotionStatus` y función `isPromocionVigente()`. |
| `domains/promotions/promotion.service.ts` | Carga, cachea, filtra y expone signals reactivas. |
| `features/promo/promo.ts` | Componente. Inyecta el servicio, adapta la señal al template. |
| `features/promo/promo.html` | Template. Renderiza la promo con `@for` + `track`. |
| `features/promo/promo.css` | Estilos, animaciones de entrada, hover, responsive, reduced motion. |

---

## Capas del flujo

### 1. Datos estáticos → `promotions.json`

```
public/assets/data/promotions/promotions.json
```

Array de objetos `Promotion[]`. Cada objeto tiene 14 campos:

```typescript
interface Promotion {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  buttonLabel: string;
  buttonUrl: string;
  startDate: string;    // ISO YYYY-MM-DD
  endDate: string;      // ISO YYYY-MM-DD
  priority: number;
  status: 'draft' | 'scheduled' | 'active' | 'expired';
  badge?: string;
  theme?: 'primary' | 'secondary' | 'accent' | 'dark';
}
```

El JSON puede contener N promos en cualquier estado. El frontend filtra en
runtime.

### 2. Servicio → `PromoService`

```typescript
@Injectable({ providedIn: 'root' })
export class PromoService { … }
```

**Fuente única de datos.** Singleton. Tres salidas:

| Señal | Tipo | Descripción |
|---|---|---|
| `activePromotions` | `computed<Promotion[]>` | Promos vigentes filtradas + ordenadas |
| `currentPromotion` | `computed<Promotion \| null>` | La de mayor prioridad, o null |
| `error` | `signal<boolean>` | `true` si el HTTP falló |

#### Ciclo de vida interno

```
constructor()
  │
  ▼
promo$ = this.http.get<Promotion[]>(…)
  │ .pipe(shareReplay(1), catchError(…))
  ▼
#promos = toSignal(promo$, { initialValue: [] })
  │
  ├──► activePromotions = computed(() =>
  │      this.#promos()
  │        .filter(p => isPromocionVigente(p))
  │        .sort((a, b) => b.priority - a.priority)
  │    )
  │      │
  │      └──► currentPromotion = computed(() =>
  │             this.activePromotions()[0] ?? null
  │           )
  │
  └──► error signal (seteado si catchError se dispara)
```

#### Detalle de `isPromocionVigente`

```typescript
export function isPromocionVigente(promo: Promotion, referenceDate?: Date): boolean
```

La función vive en `promotion.model.ts` por ser lógica pura de dominio (sin
dependencias de Angular). Evalúa:

1. `promo.status === 'active'`
2. `startDate <= ref <= endDate`

Donde `ref` es la fecha actual en la zona horaria del salón:

```typescript
const SALON_TIMEZONE = 'America/Mexico_City';

function getFechaSalon(date: Date): string {
  return date.toLocaleDateString('en-CA', { timeZone: SALON_TIMEZONE });
}
```

Usar `Intl.DateTimeFormat` con timezone explícito evita el desfasaje de
`toISOString()` que devuelve UTC. Un salón en CDMX no debería ver su promo
vencida 6 horas antes por un sesgo UTC.

### 3. Componente → `PromoComponent`

```typescript
export class PromoComponent {
  private readonly promoService = inject(PromoService);
  readonly hasError = this.promoService.error;
  readonly currentPromotion = this.promoService.currentPromotion;

  readonly promoList = computed(() => {
    const p = this.currentPromotion();
    return p ? [p] : [];
  });
}
```

El componente es **delgado**. Tiene una sola transformación:

| Señal | Origen | Propósito |
|---|---|---|
| `hasError` | `promoService.error` | Estado de error del HTTP |
| `currentPromotion` | `promoService.currentPromotion` | Referencia directa |
| `promoList` | `computed` propio | `[p]` si hay promo, `[]` si no |

#### `promoList` — adapter de vista

Convierte `Promotion | null` en `Promotion[]` para usar con `@for` + `track`:

```html
@for (promo of promoList(); track promo.id) {
  <section class="promo-section">…</section>
}
```

Cuando `currentPromotion` cambia de una promo a otra:
1. `promoList` cambia de `[promo-001]` a `[promo-002]`
2. Angular detecta `track.promo.id` distinto
3. Destruye el DOM de `promo-001`
4. Crea el DOM de `promo-002`
5. Las animaciones CSS de entrada se reproducen desde cero

Sin `@for` + `track`, Angular reutilizaría el nodo del DOM y solo
actualizaría los text bindings, sin gatillar las animaciones.

### 4. Template → `promo.html`

Tres estados posibles:

```
┌─ hasError() = true ──────────────────────────────────────┐
│  <section> con mensaje de error                           │
└───────────────────────────────────────────────────────────┘

┌─ promoList tiene 1 item ──────────────────────────────────┐
│  <section> con grid (imagen + contenido)                  │
│    ├── promo.image     → <img>                            │
│    ├── promo.badge     → badge animado (pop + float)      │
│    ├── promo.title     → <h3>                             │
│    ├── promo.subtitle  → <p> (opcional)                   │
│    ├── promo.endDate   → "Válido hasta …"                 │
│    ├── promo.description → <p>                            │
│    └── promo.buttonLabel/buttonUrl → <app-cta-button>     │
└───────────────────────────────────────────────────────────┘

┌─ promoList vacío ─────────────────────────────────────────┐
│  (nada — cero DOM)                                        │
└───────────────────────────────────────────────────────────┘
```

---

## Árbol de dependencias

```
promotion.model.ts
  ├── Promotion (interface)
  ├── PromotionStatus (type)
  └── isPromocionVigente()
        └── getFechaSalon()          (privada)
              └── SALON_TIMEZONE     (const)

promotion.service.ts
  ├── PromoService
  │     ├── promo$                   (private Observable)
  │     ├── #promos                  (private signal via toSignal)
  │     ├── error                    (public signal)
  │     ├── activePromotions         (public computed)
  │     ├── currentPromotion         (public computed)
  │     └── getCurrent()             (public Observable — legacy)
  └── imports: HttpClient, toSignal, isPromocionVigente

promo.ts
  ├── PromoComponent
  │     ├── hasError                 (ref a promoService.error)
  │     ├── currentPromotion         (ref a promoService.currentPromotion)
  │     └── promoList                (computed propio)
  └── imports: CtaButton

promo.html
  └── template: @if error / @for promoList / nada
```

---

## Diagrama de flujo temporal

```
Tiempo ──────────────────────────────────────────────────────────────►

┌────────┐    ┌──────────┐    ┌──────────────┐    ┌──────────────┐
│  JSON  │    │  Http    │    │  #promos      │    │  Componente  │
│  file  │───►│  Client  │───►│  (signal)     │───►│              │
└────────┘    └──────────┘    └──────┬───────┘    │  promoList   │
                                     │            │  .html       │
                                     ▼            └──────────────┘
                              ┌──────────────┐
                              │ activePromos │
                              │ (computed)   │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ currentPromo │
                              │ (computed)   │
                              └──────────────┘
                                     │
                                     │ ref
                                     ▼
                              ┌──────────────┐
                              │ promoList    │
                              │ (computed)   │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  @for +      │
                              │  track id    │
                              └──────────────┘
```

---

## Responsabilidades (qué belongs dónde)

| Lógica | Ubicación | Motivo |
|---|---|---|
| Definir `Promotion` y `PromotionStatus` | `promotion.model.ts` | Tipo del dominio |
| `isPromocionVigente()` | `promotion.model.ts` | Lógica pura, sin Angular |
| FETCH + cache HTTP | `PromoService` | Singleton, capa de datos |
| Filtrar por status + fecha | `PromoService.activePromotions` | Lógica de negocio |
| Elegir la de mayor priority | `PromoService.currentPromotion` | Decisión del dominio |
| Error de carga | `PromoService.error` | Estado del servicio |
| `[p] / []` adapter para @for | `PromoComponent.promoList` | Decisión de renderizado |
| Animar cambio de promo | `promo.html` + `promo.css` | Solo presentación |
| Hover, responsive, reduced motion | `promo.css` | Solo presentación |
