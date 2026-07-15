# Flujo de datos — Servicios + Badges

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  services.json                                                              │
│  assets/data/services/services.json                                         │
│                                                                             │
│  [                                                                          │
│    {                                                                        │
│      id: "corte",                                                           │
│      name: "Corte de cabello",                                              │
│      price: 1500,                                                           │
│      durationMinutes: 45,                                                   │
│      duration: "45 min",                                                    │
│      icon: "scissors",                                                      │
│      category: "cabello",                                                   │
│      sortOrder: 10,                                                         │
│      image: "images/services/corte-...",                                    │
│      badges: [                           ← array extensible                │
│        { id: "popular", label: "Popular", priority: 10,                     │
│          color: "brand", icon: "star" }                                     │
│      ]                                                                      │
│    },                                                                       │
│    { id: "color", badges: [{ id: "new", label: "Nuevo", ... }] },          │
│    { id: "manicuria", badges: [{ id: "best-seller", ... }] },              │
│    { id: "pedicuria" },                        ← sin badge                 │
│    ...                                                                      │
│  ]                                                                          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ GET assets/data/services/services.json
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ServiceService  (domains/services/service.service.ts)                      │
│                                                                             │
│  allServices$ ──► http.get<Service[]>() .pipe(shareReplay, catchError)      │
│    │                                                                         │
│    ▼ #normalize(services)                     ← método privado              │
│  Ordena servicios por sortOrder                                              │
│  Ordena badges por priority dentro de cada servicio                         │
│    │                                                                         │
│    ├── getAll()        ──► Observable<Service[]>  ── toda la lista          │
│    ├── getById(id)     ──► Observable<Service | undefined>                  │
│    ├── getByCategory() ──► Observable<Service[]>  ── filtro por categoría   │
│    ├── getByBadge(id)  ──► Observable<Service[]>  ── filtro por badge       │
│    └── getPopular()    ──► Observable<Service[]>  ── delega en getByBadge() │
│                                                                             │
│  error = signal(false)                         ← señal de error            │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ toSignal()
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ServicesComponent  (features/services/services.ts)                        │
│                                                                             │
│  services = toSignal(getAll(), { initialValue: [] })                        │
│    │                                                                         │
│    ├── featuredServices ── computed ──► services con al menos un badge      │
│    │   Útil para secciones promocionales, home, carruseles                  │
│    │                                                                         │
│    └── servicesByPriority ── computed ──► servicios ordenados por:          │
│        1. Con badges primero (por priority del badge más importante)        │
│        2. Sin badges al final (por sortOrder)                               │
│                                                                             │
│  hasError = serviceService.error                                            │
│  servicesTitle / servicesSubtitle ── desde ContentService                   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ @for (service of services())
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ServiceCard  (shared/components/service-card/)                            │
│                                                                             │
│  @let badges = service().badges                                             │
│  @if (badges?.length) {                                                     │
│    <div class="card-badges">                ← posicionado sobre la imagen  │
│      @for (badge of badges) {                                              │
│        <app-badge [badge]="badge" />       ← delega el render              │
│      }                                                                      │
│    </div>                                                                   │
│  }                                                                          │
│                                                                             │
│  <!-- contenido de la card: nombre, descripción, precio, botón -->          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ <app-badge>
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  AppBadge  (shared/components/badge/)                                      │
│                                                                             │
│  Input: Badge (shared/types/badge.types.ts — genérico, cross-dominio)      │
│                                                                             │
│  Template:                                                                  │
│  <span class="badge" [class]="'badge--' + badge().color">                  │
│    @if (badge().icon) {                                                     │
│      <svg-icon [name]="$any(badge().icon)" size="10" />                    │
│    }                                                                        │
│    {{ badge().label }}                                                      │
│  </span>                                                                    │
│                                                                             │
│  CSS:                                                                       │
│  - Fondo tintado: color-mix(color 10%, surface)                            │
│  - Borde sutil:   color-mix(color 25%, transparent)                        │
│  - Texto elegante: color-mix(color 80%, neutral-900)                       │
│  - Animación: fadeIn 0.3s ease-out, con stagger por --badge-delay          │
│  - Variantes de color: brand, success, accent, neutral, warning            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Esquema de tipos

```
shared/types/
└── badge.types.ts
    └── Badge                        ← Genérico, reusable cross-dominio
        ├── id: string               ← Abierto, cada dominio refina
        ├── label: string
        ├── priority: number
        ├── color: string
        └── icon?: string

domains/services/service.types.ts
    ├── ServiceBadgeId               ← 'new' | 'popular' | 'best-seller' | ...
    └── ServiceBadge = Badge & { 
            readonly id: ServiceBadgeId 
        }                            ← Refinamiento del tipo base

domains/services/service.model.ts
    └── Service
        ├── id: string
        ├── name: string
        ├── price: number
        ├── ...otros campos...
        └── badges?: readonly ServiceBadge[]
```

## Reglas de negocio

| Concepto | Implementación |
|---|---|
| Servicio sin badge | `badges` no está definido o es `[]` |
| Múltiples badges | Array ordenado por `priority` en `normalize()` |
| Prioridad visual | Menor `priority` = aparece primero |
| Color del badge | Campo `color` → clase CSS `badge--{color}` |
| Servicios destacados | `featuredServices` computed filtra `badges?.length > 0` |
| Orden promocional | `servicesByPriority`: con badges primero, por `sortOrder` dentro del mismo nivel |
| Filtro por badge | `getByBadge(badgeId)` → servicios con ese badge |
| Badge sin texto fijo | `label` viene del JSON, no del código |

## Consumidores

- **ServicesComponent** — grid de cards con badges sobre la imagen
- **ServiceCard** — contenedor que posiciona badges y delega render a `<app-badge>`
- **Futuros**: Promociones, Equipo, Blog, Eventos, Cupones — todos pueden usar `<app-badge>` con el mismo input

## Badge component — uso cross-dominio

```html
<!-- Cualquier dominio puede usar <app-badge> sin importar
     ServiceBadge. Solo necesita pasar un objeto que cumpla Badge. -->

<!-- Services -->
<app-badge [badge]="{ id: 'popular', label: 'Popular', color: 'brand', priority: 10 }" />

<!-- Team -->
<app-badge [badge]="{ id: 'expert', label: 'Especialista', color: 'accent', priority: 10 }" />

<!-- Blog -->
<app-badge [badge]="{ id: 'new', label: 'Nuevo', color: 'success', priority: 10 }" />

<!-- Promos -->
<app-badge [badge]="{ id: 'limited', label: 'Válido hasta el 31/07', color: 'warning', priority: 10 }" />
```

El componente es agnóstico del dominio. La interfaz `Badge` vive en `shared/types/` y es el contrato que cualquier entidad debe cumplir para tener badges visuales.
