# Promotion — Campos editables vs. control del sistema

> Una futura versión del sistema tendrá un panel administrativo donde el cliente
> (dueñe del salón) pueda crear y editar promociones sin tocar código.
>
> Este documento define **quién controla cada campo**, las reglas de negocio que
> lo gobiernan y cómo se relacionan entre sí.

---

## Resumen visual

```
╔══════════════════════════════════╦══════════════════╦══════════════════╗
║          Campo                   ║   Admin panel    ║    Sistema       ║
╠══════════════════════════════════╬══════════════════╬══════════════════╣
║ id                              ║                  ║  ✅ genera       ║
║ title                           ║  ✅ edita        ║                  ║
║ subtitle                        ║  ✅ edita        ║                  ║
║ description                     ║  ✅ edita        ║                  ║
║ image                           ║  ✅ sube/selec  ║  valida formato  ║
║ buttonLabel                     ║  ✅ edita        ║                  ║
║ buttonUrl                       ║  ✅ edita        ║  valida URL      ║
║ startDate                       ║  ✅ edita        ║  valida rango    ║
║ endDate                         ║  ✅ edita        ║  valida rango    ║
║ priority                        ║  ✅ edita        ║  ⚠️  techo        ║
║ status                          ║  ✅ transita     ║  ⚠️  controla     ║
║ badge                           ║  ✅ edita        ║                  ║
║ theme                           ║  ✅ selecciona   ║                  ║
║ createdAt / updatedAt           ║                  ║  ✅ genera       ║
╚══════════════════════════════════╩══════════════════╩══════════════════╝
```

---

## Análisis campo por campo

### `id: string`

| Control | Valor |
|---|---|
| Admin | ❌ No editable |
| Sistema | ✅ Generado automáticamente (UUID, slug o nanoID) |

**Regla:** inmutable después de creación. Si el cliente duplica una promo,
se genera un `id` nuevo.

**Razonamiento:** es la identidad del registro. El cliente no necesita saber
que existe. Para referenciar una promo se usa título, badge o fecha, no el id.

---

### `title: string`

| Control | Valor |
|---|---|
| Admin | ✅ Editable libremente |
| Sistema | ❌ No interviene |

**Validaciones del admin panel:**
- Requerido
- Máximo 80 caracteres (para que no desborde el diseño en mobile)

---

### `subtitle?: string`

| Control | Valor |
|---|---|
| Admin | ✅ Editable, opcional |
| Sistema | ❌ No interviene |

**Regla:** puede estar vacío. El template lo oculta si no existe:
`@if (promo.subtitle) { ... }`

---

### `description: string`

| Control | Valor |
|---|---|
| Admin | ✅ Editable |
| Sistema | ❌ No interviene |

**Validación:** máximo 300 caracteres. Suficiente para un párrafo breve,
evita textos kilométricos que rompan el diseño de la hero section.

---

### `image: string`

| Control | Valor |
|---|---|
| Admin | ✅ Sube o selecciona imagen |
| Sistema | ✅ Valida tipo, dimensiones y peso |

**Validaciones del sistema:**
- Formatos aceptados: WebP, JPEG, PNG
- Peso máximo: 500 KB
- Dimensiones mínimas: 600×750 px (para que no se vea pixelada en el grid)
- Procesamiento: convertir a WebP al subir

**Regla:** el cliente nunca escribe una URL directamente. El panel ofrece un
selector de archivos o un media library. El backend guarda la imagen y devuelve
la URL. Así se evitan hotlinks rotos y se optimiza el asset.

---

### `buttonLabel: string`

| Control | Valor |
|---|---|
| Admin | ✅ Editable |
| Sistema | ❌ No interviene |

**Validación:** 2–30 caracteres. Suficiente para "Agenda ahora", "Ver más",
"Reserva tu cita", etc.

---

### `buttonUrl: string`

| Control | Valor |
|---|---|
| Admin | ✅ Editable |
| Sistema | ✅ Valida URL |

**Validaciones del sistema:**
- Debe ser una URL absoluta (`https://...`) o un path relativo (`/servicios/...`)
- Si es WhatsApp: formato aceptable `https://wa.me/521...` o `tel:...`
- Máximo 500 caracteres

**Regla:** el sistema no interpreta ni modifica la URL. Solo valida formato.

---

### `startDate: string` (ISO YYYY-MM-DD)

| Control | Valor |
|---|---|
| Admin | ✅ Editable |
| Sistema | ✅ Valida coherencia |

**Validaciones del sistema:**
- No puede ser posterior a `endDate`
- Si es una promo nueva y el estado es `active`, la fecha debe ser ≤ hoy en CDMX
- Si se está editando y la promo ya está activa, la fecha NO se puede mover al
  futuro (rompería la promoción en curso)

**Regla de negocio:** el cliente puede programar promos con startDate futuro.
El sistema la mantendrá en `draft` o `scheduled` hasta que la fecha llegue.

---

### `endDate: string` (ISO YYYY-MM-DD)

| Control | Valor |
|---|---|
| Admin | ✅ Editable |
| Sistema | ✅ Valida coherencia + aplica transición automática |

**Validaciones del sistema:**
- Debe ser posterior a `startDate`
- Máximo 90 días de duración (evita promos eternas)

**Regla de negocio:** cuando `endDate` pase en CDMX, el sistema cambia
`status` a `expired` automáticamente. El cliente no puede revocar ese cambio.

---

### `priority: number`

| Control | Valor |
|---|---|
| Admin | ✅ Editable |
| Sistema | ⚠️ Techo forzoso |

**Validaciones del sistema:**
- Rango permitido: 0–100
- Solo N promos pueden tener priority > 80 a la vez (evita que el cliente
  ponga todo en "súper urgente" y el cómputo pierda sentido)

**Regla de negocio:** de todas las promos vigentes, gana la de mayor priority.
Si hay empate, gana la más reciente por `startDate` (o por `createdAt`).

**Razonamiento del techo:** si todas las promos tienen priority alta, el
concepto de prioridad se devalúa. El techo forzoso obliga al cliente a elegir
qué es realmente importante.

---

### `status: PromotionStatus`

| Estado | Admin puede setear? | Sistema controla? |
|---|---|---|
| `draft` | ✅ Sí, desde cero | ❌ |
| `scheduled` | ✅ Sí, para fechas futuras | ❌ |
| `active` | ✅ Sí, si startDate ≤ hoy | ❌ |
| `expired` | ❌ No puede setearlo manualmente | ✅ Automático al pasar endDate |

**Máquina de estados:**

```
                    ┌──────────────────────────────┐
                    │  draft                       │
                    │  (borrador invisible)         │
                    └──────┬───────────────────────┘
                           │ admin cambia a scheduled
                           │ si startDate > hoy
                           ▼
                    ┌──────────────────────────────┐
              ┌─────│  scheduled                   │◄──── admin puede
              │     │  (programada, aún no visible) │      volver a draft
              │     └──────┬───────────────────────┘
              │            │ llega startDate (sistema)
              │            ▼
              │     ┌──────────────────────────────┐
              │     │  active                      │◄──── admin puede
              │     │  (visible en el sitio)       │      pasar a draft
              │     └──────┬───────────────────────┘      (desactivar)
              │            │ pasa endDate (sistema)
              │            ▼
              │     ┌──────────────────────────────┐
              └─────│  expired                     │──► (inmutable)
                    │  (ya no se muestra)          │
                    └──────────────────────────────┘
```

**Transiciones desde el admin panel:**

| De → A | Permitido? | Condición |
|---|---|---|
| `draft` → `scheduled` | ✅ | `startDate > today` |
| `draft` → `active` | ✅ | `startDate ≤ today` |
| `scheduled` → `draft` | ✅ | Siempre |
| `scheduled` → `active` | ✅ | `startDate ≤ today` |
| `active` → `draft` | ✅ | Siempre (desactivar manual) |
| `active` → `scheduled` | ❌ | No tiene sentido lógico |
| `active` → `expired` | ❌ | Solo el sistema |
| `expired` → cualquier | ❌ | Inmutable |

**Reglas del sistema:**
- Una promo en `expired` es inmutable. El cliente debe **duplicarla** con
  nuevas fechas.
- Al duplicar, el sistema copia todos los campos excepto `id`, `status`
  (empieza en `draft`), `startDate` y `endDate` (vacíos para llenar).

---

### `badge?: string`

| Control | Valor |
|---|---|
| Admin | ✅ Editable, opcional |
| Sistema | ❌ No interviene |

**Validación:** 2–20 caracteres. Texto corto como "50% OFF", "Nuevo",
"Edición limitada". Aparece flotando sobre la imagen.

Si está vacío, el template lo omite y la promo se muestra sin badge.

---

### `theme?: 'primary' | 'secondary' | 'accent' | 'dark'`

| Control | Valor |
|---|---|
| Admin | ✅ Selecciona de lista fija |
| Sistema | ✅ Valida contra el enum |

**Regla:** no es texto libre. El admin panel ofrece 4 opciones que cambian
los colores del componente. Si no se selecciona ninguno, se usa el default
(sin clase `theme-*`, que equivale al estilo base del componente).

---

### `createdAt: string` / `updatedAt: string`

*(Campos nuevos que habría que agregar al modelo)*

| Control | Valor |
|---|---|
| Admin | ❌ No editable |
| Sistema | ✅ Genera y actualiza automáticamente |

**Reglas:**
- `createdAt`: se fija al crear la promo. Nunca cambia.
- `updatedAt`: se actualiza cada vez que el admin o el sistema modifica la promo.

---

## Resumen de control

```
                                ════════════════
                                ADMINISTRABLE

   title       subtitle       description       image
   buttonLabel   buttonUrl   startDate   endDate
   priority     badge         theme

                                ════════════════
                                SISTEMA (no tocar)

   id           createdAt      updatedAt
   status → expired (automático)
   validaciones de formato, rango, coherencia
```

---

## Lo que NO cambia en el frontend

Sin importar quién controle cada campo, el **modelo `Promotion`** y el
**pipeline de signals** se mantienen idénticos. El componente consume lo que
el servicio expone. El servicio siempre recibe un objeto `Promotion` —
venga de JSON, API o WebSocket.

La única diferencia es que el servicio podría **refetch** cuando el admin
guarde cambios, pero la reactividad downstream (computed → template) es
transparente.

---

## Reglas de validación — checklist para backend

| Campo | Requerido? | Máx | Otras reglas |
|---|---|---|---|
| `id` | auto | — | UUID v7 o nanoID |
| `title` | ✅ | 80 | — |
| `subtitle` | — | 120 | — |
| `description` | ✅ | 300 | — |
| `image` | ✅ | 500 KB | WebP/JPEG/PNG, min 600×750 |
| `buttonLabel` | ✅ | 30 | Mín 2 caracteres |
| `buttonUrl` | ✅ | 500 | URL absoluta o relativa válida |
| `startDate` | ✅ | — | ≤ endDate |
| `endDate` | ✅ | 90 días desde start | ≥ startDate |
| `priority` | ✅ | 100 | 0–100, techo de N > 80 |
| `status` | ✅ | — | Ver máquina de estados |
| `badge` | — | 20 | — |
| `theme` | — | — | Solo valores del enum |
