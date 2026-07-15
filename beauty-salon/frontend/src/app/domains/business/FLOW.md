# Flujo de datos — Horarios de atención

```
┌─────────────────────────────────────────────────────────────────────────┐
│  business.json                                                          │
│  assets/data/business/business.json                                     │
│                                                                         │
│  schedule: {                                                            │
│    regular: [                    ← 7 días con shifts[]                  │
│      { day: 'monday',   shifts: [{ start: '09:00', end: '19:00' }] },  │
│      { day: 'friday',   shifts: [{ start, end }, { start, end }] },    │
│      { day: 'sunday',   shifts: []                         ← cerrado } │
│    ],                                                                   │
│    exceptions: [                  ← festivos / horarios especiales      │
│      { date: '2026-12-25', type: 'closed',     reason: 'Navidad' },    │
│      { date: '2026-12-24', type: 'special_hours', shifts: [...] }      │
│    ]                                                                    │
│  }                                                                      │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ GET /assets/data/business/business.json
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  BusinessService  (business.service.ts)                                 │
│                                                                         │
│  data$ ──► http.get(…) .pipe(shareReplay, catchError)                  │
│    │                                                                     │
│    ▼ toSignal()                                                         │
│  data = Signal<BusinessConfig>                                          │
│    │                                                                     │
│    ├── schedule ──── computed ──► data().contact.schedule               │
│    │   ├── regularSchedule  ── computed ──► schedule().regular          │
│    │   ├── exceptions       ── computed ──► schedule().exceptions       │
│    │   │                                                                 │
│    │   ├── businessHours ──── computed ──► regularSchedule.map()        │
│    │   │   Transforma BusinessDay[] → { label, hours, isClosed, ...}[]  │
│    │   │   Listo para renderizar en templates                           │
│    │   │                                                                 │
│    │   ├── todaySchedule ──── computed ──► resuelve día actual          │
│    │   │   1. Obtiene fecha CDMX (America/Mexico_City)                  │
│    │   │   2. Busca excepción para la fecha                             │
│    │   │   3. Si no hay, busca día en regularSchedule                   │
│    │   │   Retorna { day, label, shifts, hours, isClosed, ... }        │
│    │   │                                                                 │
│    │   └── isOpenNow ────── computed ──► compara ahora vs todaySchedule │
│    │       today ? closed ?                                             │
│    │       Compara getCurrentTimeCDMX() contra cada shift               │
│    │       true si ahora ∈ [start, end) en algún bloque                 │
│    │                                                                     │
│    └── getDaySchedule(day) ──── función pura ──► busca en regular       │
│        Retorna BusinessDay | undefined                                   │
│                                                                         │
│  CONSTANTES:                                                            │
│    SALON_TIMEZONE = 'America/Mexico_City'                               │
│    DAY_LABELS: { monday: 'Lunes', ... }                                 │
│    JS_DAY_MAP: [sunday, monday, ...]                                    │
│    FALLBACK: objeto vacío (error loading)                               │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    │ Signals compartidas (providedIn: 'root')
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
┌──────────────────────────┐ ┌──────────────────────────┐
│  ContactComponent        │ │  FooterComponent          │
│  contact.ts              │ │  footer.ts                │
│                          │ │                           │
│  inyecta BusinessService │ │  inyecta BusinessService  │
│                          │ │                           │
│  businessHours ─── signal│ │  businessHours ─── signal │
│  isOpenNow ────── signal │ │  isOpenNow ────── signal │
│                          │ │                           │
│  Usos adicionales:       │ │  Solo horarios + estado   │
│  - getDaySchedule(día)   │ │                           │
│  - exceptions()          │ │                           │
└──────────┬───────────────┘ └──────────┬────────────────┘
           │                            │
           ▼                            ▼
┌──────────────────────────┐ ┌──────────────────────────┐
│  contact.html            │ │  footer.html              │
│                          │ │                           │
│  @for (businessHours)    │ │  @for (businessHours)     │
│    {{ day.label }}       │ │    {{ item.label }}       │
│    {{ day.hours }}       │ │    {{ item.hours }}       │
│                          │ │                           │
│  {{ isOpenNow             │ │  {{ isOpenNow             │
│     ? 'Abierto ahora'    │ │     ? 'Abierto ahora'     │
│     : 'Cerrado' }}       │ │     : 'Cerrado' }}        │
│                          │ │                           │
│  aria-live="polite"      │ │  aria-live="polite"       │
│  status-dot aria-hidden  │ │  status-dot aria-hidden   │
│  transición CSS 0.45s    │ │  transición CSS 0.45s     │
└──────────────────────────┘ └──────────────────────────┘
```

## Esquema de tipos

```
BusinessConfig
├── site: BusinessSite
├── contact: BusinessContact
│   └── schedule: WeeklySchedule ◄── Acá viven los horarios
│       ├── regular: BusinessDay[]
│       │   └── BusinessDay
│       │       ├── day: DayOfWeek     ('monday' | … | 'sunday')
│       │       ├── shifts: BusinessHours[]
│       │       │   └── BusinessHours  { start: string, end: string }
│       │       └── note?: string
│       └── exceptions?: ScheduleException[]
│           └── ScheduleException
│               ├── date: string       (YYYY-MM-DD)
│               ├── type: 'closed' | 'special_hours' | 'extended_hours'
│               ├── shifts?: BusinessHours[]
│               └── reason: string
└── seo: BusinessSeo
```

## Reglas de negocio

| Concepto | Implementación |
|---|---|
| Día cerrado | `shifts: []` (array vacío) |
| Horario continuo | 1 shift → `"09:00 – 19:00"` |
| Dos turnos | 2 shifts → `"09:00 – 14:00 / 16:00 – 21:00"` |
| Excepción cerrado | `type: 'closed'` → sobrescribe el día |
| Excepción especial | `type: 'special_hours'` → usa shifts de la excepción |
| Zona horaria | `America/Mexico_City` — todas las comparaciones |
| Abierto ahora | `isOpenNow()` compara HH:mm contra cada shift del día actual |
| Capacidad de reserva | `isClosedDay` en Contact → bloquea paso 3 si el día seleccionado está cerrado |

## Consumidores

- **ContactComponent**: horario semanal completo + estado ahora + validación de día cerrado para reservas
- **FooterComponent**: horario semanal completo + estado ahora
- **BusinessService.getDaySchedule(day)**: usado por Contact para verificar si un día específico está cerrado
