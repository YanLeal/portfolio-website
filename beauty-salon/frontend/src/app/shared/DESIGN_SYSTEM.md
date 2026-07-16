# Design System — Convenciones

> Reglas de naming, inputs, outputs, signals, CSS, animaciones y accesibilidad para componentes compartidos en `shared/components/`.

---

## 1. Naming

### Componentes

| Elemento | Convención | Ejemplo |
|---|---|---|
| Selector | `app-` + kebab-case | `app-service-card` |
| Clase | PascalCase, **sin** sufijo `Component` | `ServiceCard` |
| Archivo | kebab-case, **sin** `.component` | `service-card.ts` |
| Directorio | kebab-case, coincide con el archivo | `service-card/` |
| HTML template | `<nombre>.html` | `service-card.html` |
| CSS | `<nombre>.css` | `service-card.css` |

```typescript
@Component({
  selector: 'app-service-card',
  standalone: true,
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
})
export class ServiceCard { … }
```

### Directivas

| Elemento | Convención | Ejemplo |
|---|---|---|
| Selector | `[app*]` camelCase | `[appCardTilt]` |
| Clase | PascalCase + `Directive` | `CardTiltDirective` |
| Archivo | kebab-case + `.directive` | `card-tilt.directive.ts` |

### Pipes

| Elemento | Convención | Ejemplo |
|---|---|---|
| Clase | PascalCase + `Pipe` | `DurationPipe` |
| Nombre | camelCase | `name: 'duration'` |
| Archivo | kebab-case + `.pipe` | `duration.pipe.ts` |

### Tokens (InjectionToken)

| Elemento | Convención | Ejemplo |
|---|---|---|
| Constante | SCREAMING_SNAKE_CASE | `WHATSAPP_NUMBER` |
| Archivo | kebab-case + `.token` | `whatsapp.token.ts` |

---

## 2. Inputs

### Reglas generales

- Todos los inputs se declaran con **signal-based inputs** (`input()` / `input.required()`).
- Naming en **camelCase**.
- Inputs requeridos usan `input.required<T>()`.
- Inputs opcionales tienen valor por defecto: `input<T>(default)`.

```typescript
// Requerido
readonly name = input.required<string>();

// Opcional con default
readonly variant = input<'base' | 'lift'>('lift');

// Opcional sin default (undefined si no se pasa)
readonly subtitle = input<string>();
```

### Inputs booleanos

- **NO** usar prefijo `is` — usar adjetivo directo.
- Excepción: estados internos de un componente (señales de estado local) pueden usar `is` para distinguirlos de inputs.

```typescript
// ✅ Correcto — inputs booleanos
readonly open = input(false);
readonly narrow = input(false);
readonly required = input(false);
readonly external = input(false);
readonly animate = input(true);
readonly active = input(false);
readonly zoomActive = input(false);

// ❌ Incorrecto
readonly isSelected = input(false);       // → selected
readonly showLabel = input(true);          // → labelVisible (u otra semántica)
```

---

## 3. Outputs

- Usar la función `output<T>()` (Angular 17+), **no** `new EventEmitter<T>()`.
- **Pasado** para eventos que ya ocurrieron: `clicked`, `selected`, `closed`, `toggled`.
- **Presente** solo para side-effects continuos muy específicos.

```typescript
// ✅ Pasado — evento ya ocurrido
readonly clicked = output<void>();
readonly selected = output<string>();
readonly imageClicked = output<GalleryImage>();

// ⚠️ A evitar — presente sin razón
readonly close = output<void>();     // → closed
readonly toggle = output<void>();    // → toggled
readonly action = output<string>();  // → use verbo en pasado
```

---

## 4. Signals

### Input signals

Única forma de declarar inputs. Ver sección [Inputs](#2-inputs).

### Estado interno

- `signal<T>(initialValue)` para estado mutable interno.
- `computed<T>(() => ...)` para valores derivados.
- `effect(() => { ... })` solo para side-effects explícitos (sync con DOM, logging).

```typescript
export class ImageCompare {
  // Inputs
  readonly beforeImage = input.required<string>();
  readonly active = input(false);

  // Estado interno
  readonly sliderPosition = signal(50);
  readonly isDragging = signal(false);
  readonly isZoomed = signal(false);

  // Derivado
  readonly sliderValueText = computed(() => `${Math.round(this.sliderPosition())}%`);
  readonly waLink = computed(() => `https://wa.me/${this.phone()}`);
}
```

### Convención de naming

| Tipo | Prefijo/Sufijo | Ejemplo |
|---|---|---|
| Input | (ninguno) | `readonly name = input.required<T>()` |
| Estado interno | semántico | `sliderPosition`, `currentIndex` |
| Estado booleano interno | `is` + adjetivo | `isDragging`, `isZoomed`, `isLeaving` |
| Derivado | semántico | `sliderValueText`, `filteredItems` |

> Nota: los internos usan `is` cuando el bool representa estado del componente, NO input.

---

## 5. CSS

### Encapsulation

- Usar `ViewEncapsulation.Emulated` (default).
- `ViewEncapsulation.None` solo cuando el componente necesita estilar contenido proyectado (ej: `FormField`).

### Convención de clases

- **BEM-like** para clases semánticas del componente.
- **Tailwind utility classes** en templates para spacing, tipografía, colores y layout.
- Preferir Tailwind sobre CSS propio para valores del design system.

```html
<!-- Clases BEM para estructura + Tailwind para estilo -->
<div class="card card-entrance">
  <span class="badge badge--success bg-primary text-sm font-medium">
    {{ label }}
  </span>
</div>
```

### Design Tokens

Los colores, spacing y tipografía se definen como variables CSS en el theme global (`styles.css` / `fonts.css`). Los componentes deben referenciarlas, no hardcodear valores.

```css
/* ✅ Correcto */
.badge--success {
  background-color: var(--color-success);
}

/* ❌ Evitar */
.badge--success {
  background-color: #16a34a;
}
```

### Host bindings

Usar `host: { class: '...' }` para clases fijas del host element en vez de estilar `:host`:

```typescript
@Component({
  host: { class: 'card-entrance block' },
})
```

---

## 6. Animaciones

- **CSS transitions y animations** por defecto. No usar Angular animation triggers a menos que se necesite routing o listas.
- Usar clases utilitarias de Tailwind: `transition-all`, `duration-300`, `ease-out`, etc.

```html
<div class="transition-transform duration-300 ease-out group-hover:scale-110">
```

- Animaciones de entrada (cards, secciones) via CSS `@keyframes`:

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(1rem); }
  to   { opacity: 1; transform: translateY(0); }
}

.card-entrance {
  animation: fadeInUp 0.4s ease-out both;
}
```

---

## 7. Accesibilidad

### Roles y landmarks

- `role="dialog"` + `aria-modal="true"` en modales/backdrops.
- `role="button"` en elementos clickeables que no sean `<button>`.
- Landmarks semánticos (`<nav>`, `<main>`, `<footer>`) a nivel layout.

### ARIA

| Atributo | Cuándo usarlo |
|---|---|
| `aria-label` | Input `ariaLabel` en iconos, carruseles, modales. |
| `aria-hidden` | `true` en iconos decorativos (SVG sin label). |
| `aria-modal` | `true` en modales/backdrops. |
| `aria-current` | En navegación activa. |
| `aria-expanded` | En acordeones/FAQs (pendiente). |

```typescript
// Icono decorativo → aria-hidden
readonly ariaLabel = input<string>();

// Template
<svg [attr.aria-label]="ariaLabel()"
     [attr.aria-hidden]="ariaLabel() ? null : true">
```

### Eventos de teclado

- **Escape**: cerrar modales, dropdowns, acordeones.

```typescript
@HostListener('keydown', ['$event'])
handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    this.close.emit();
  }
}
```

### Focus management

- Al abrir un modal, focus al primer elemento interactivo o al backdrop.
- Al cerrar, restaurar focus al elemento que abrió el modal.
- Usar `aria-label` descriptivo en elementos sin texto visible (icon buttons, floating buttons).

---

## Tabla de cumplimiento actual

| Regla | Estado |
|---|---|
| Selectores con `app-` | ✅ 18/18 |
| Clases sin sufijo `Component` | ✅ 18/18 |
| Clases sin prefijo `App` extra | ✅ 18/18 |
| Selector vs clase alineados | ✅ 18/18 |
| Inputs con `input()` / `input.required()` | ✅ 18/18 |
| Outputs con `output()` | ✅ 4/4 |
| Boolean inputs sin `is` | ⚠️ 16/18 (faltan: `isSelected`) |
| Outputs en pasado | ⚠️ 5/8 (faltan: `close`, `toggle`, `action`) |
