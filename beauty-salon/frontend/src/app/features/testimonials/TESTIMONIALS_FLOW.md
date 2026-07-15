# Flujo de datos — Testimonios + Carrusel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  testimonials.json                                                          │
│  assets/data/testimonials/testimonials.json                                 │
│                                                                             │
│  [                                                                          │
│    {                                                                        │
│      id: "cliente-1",                                                       │
│      name: "María G.",                                                      │
│      photo: "images/testimonial/maria.jpg",                                 │
│      text: "Excelente atención...",                                         │
│      rating: 5,                                                             │
│      service: "Corte de cabello",                                           │
│      date: "2026-06-15"                                                     │
│    },                                                                       │
│    ...                                                                      │
│  ]                                                                          │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ GET assets/data/testimonials/testimonials.json
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TestimonialService  (domains/testimonials/testimonial.service.ts)          │
│                                                                             │
│  allTestimonials$ ──► http.get<Testimonial[]>() .pipe(shareReplay,          │
│                        catchError → error signal(true), fallback [])        │
│    │                                                                         │
│    └── getAll() ──► Observable<Testimonial[]>                               │
│                                                                             │
│  error = signal(false)                         ← señal de error            │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ toSignal()
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  TestimonialsComponent  (features/testimonials/testimonials.ts)            │
│                                                                             │
│  ● inyecta TestimonialService     ● inyecta ContentService                  │
│  ● instancia CarouselController   ● computed currentTestimonial             │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  CarouselController  (shared/utils/carousel-controller.ts)          │   │
│  │                                                                      │   │
│  │  SIGNALS:                      MÉTODOS:                              │   │
│  │  currentIndex ◄── signal(0)    next()   previous()  goTo(i)          │   │
│  │  isPaused     ◄── signal(false) pause()  resume()                   │   │
│  │  direction    ◄── signal(1)    onKeydown(event)                      │   │
│  │                                                                      │   │
│  │  COMPUTEDS:                    AUTO-PLAY:                            │   │
│  │  translateX ← -{idx * 100}%   setInterval cada 6s                   │   │
│  │  isFirst    ← idx === 0       cleanup via DestroyRef                 │   │
│  │  isLast     ← idx === N-1     pause on hover / focus                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Reutilizable: cualquier componente crea uno con:                           │
│    new CarouselController({ totalItems, autoPlayInterval, destroyRef })    │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  │ mouseenter / mouseleave / click
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Template  (features/testimonials/testimonials.html)                       │
│                                                                             │
│  <section (mouseenter)="pause()" (mouseleave)="resume()">                  │
│    <app-section-header />                                                   │
│                                                                             │
│    @if (hasError())                                                         │
│      <p class="section-error">                                              │
│                                                                             │
│    @else                                                                    │
│      .carousel-track [style.transform]="translateX()"                       │
│        @for (item of testimonials(); track item.id)                        │
│          .carousel-slide > app-testimonial-card                            │
│                                                                             │
│      @if (!isFirst())  (.nav-btn--prev) (click)="previous()"               │
│      @if (!isLast())   (.nav-btn--next) (click)="next()"                   │
│                                                                             │
│      .carousel-dots                                                         │
│        @for (dots)                                                         │
│          .carousel-dot [class.active]="i === currentIndex()"               │
│          (click)="goTo(i)"                                                  │
│  </section>                                                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Ciclo de vida del auto-play

```
┌──────────┐     afterNextRender     ┌────────────┐
│  Render  │ ───────────────────────► │ Auto-play  │
│  inicial │                         │  cada 6s   │
└──────────┘                         └─────┬──────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
              mouseenter             mouseleave             DestroyRef
                    │                      │                      │
                    ▼                      ▼                      ▼
              pause()                resume()              #clearTimer()
              isPaused=true          isPaused=false        clearInterval()
              clearInterval()        setInterval(6000)     timer=null
```

## Reglas de negocio

| Concepto | Implementación |
|---|---|
| Slide activo | `currentIndex` signal, arranca en 0 |
| Loop infinito | `next()` y auto-play vuelven al primero si `isLast` |
| Loop reverso | `previous()` va al último si `isFirst` |
| Pausa por hover | `mouseenter` → `pause()` mata el timer |
| Reanudación | `mouseleave` → `resume()` arranca timer fresco |
| Cleanup | `DestroyRef.onDestroy` mata el timer (una sola vez) |
| Sin librerías | `setInterval` nativo, sin RxJS interval |
| Transform del track | `translateX()` computed sobre `currentIndex` |
| Botones ocultos | `@if (!isFirst())` / `@if (!isLast())` en template |
| Error state | `TestimonialService.error` signal, mensaje útil al usuario |

## Esquema de tipos

```
domains/testimonials/testimonial.model.ts
└── Testimonial
    ├── id: string
    ├── name: string
    ├── photo: string
    ├── text: string
    ├── rating: number
    ├── service: string
    └── date: string
```

## Señales internas del carrusel (CarouselController)

| Señal | Tipo | Inicial | Mutada por |
|---|---|---|---|
| `currentIndex` | `WritableSignal<number>` | `0` | `next()`, `previous()`, `goTo()`, auto-play |
| `isPaused` | `WritableSignal<boolean>` | `false` | `pause()`, `resume()` |
| `direction` | `WritableSignal<1 \| -1>` | `1` | `next()`, `previous()`, `goTo()` |

## Computeds derivados (CarouselController)

| Computed | Depende de | Retorna |
|---|---|---|
| `translateX` | `currentIndex` | `"translateX(-{idx * 100}%)"` |
| `isFirst` | `currentIndex` | `boolean` |
| `isLast` | `currentIndex`, `totalItems` | `boolean` |

## Computed específico del dominio (TestimonialsComponent)

| Computed | Depende de | Retorna |
|---|---|---|
| `currentTestimonial` | `carousel.currentIndex`, `testimonials` | `Testimonial \| undefined` |

## Consumidores

- **TestimonialsComponent** — sección completa con carrusel, header, navegación
- **TestimonialCard** — card individual dentro de cada slide
- **CarouselController** — reutilizable en galerías, equipo, servicios destacados, blog, promociones
- **Futuros**: Home destacado, galería de resultados, dashboard de reseñas
