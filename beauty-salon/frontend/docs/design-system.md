# Sistema de Diseño — Design Tokens

## Qué son los Design Tokens

Los Design Tokens son los valores atómicos e indivisibles que definen la apariencia visual de la interfaz. Son el vocabulario compartido entre diseño y desarrollo: en vez de escribir valores literales (un rosa, un tamaño de 16px, una sombra específica) repartidos por todo el CSS, cada decisión de diseño vive en una variable con nombre semántico.

Un token no es solo una variable CSS — es un contrato. Cuando el equipo de diseño decide cambiar el rosa principal, toca exactamente un valor y todo el sitio se actualiza. Cuando un desarrollador necesita el espaciado estándar entre secciones, escribe el nombre del token en vez de inventar un número.

El sistema tiene tres tipos de tokens:

- **Tokens primitivos:** valores puros de marca (colores hex, tamaños de fuente, escalas de espaciado). Son la materia prima.
- **Tokens semánticos:** nombres que expresan función o propósito, no apariencia. Por ejemplo, `primary` (no `rose`) para el color de acción principal, `surface` (no `white`) para fondos de card. Esto permite cambiar la paleta sin renombrar nada.
- **Tokens contextuales:** especializaciones para contextos específicos, como `focus-ring-outline-inverse` para rings blancos sobre fondos oscuros.

---

## Cómo están organizados

### Archivos

Los tokens viven en `src/styles/`. No hay un solo archivo gigante — están divididos por responsabilidad:

| Archivo | Contiene |
|---|---|
| `tokens.css` | Archivo importado por `styles.css`. Contiene colores, tipografía, espaciado, radios, sombras, z-index, focus ring, elevación semántica. Es la copia sincronizada del canónico. |
| `_tokens.css` | Archivo canónico con los mismos tokens más documentación detallada (comentarios, advertencias, ejemplos de uso). No se importa directamente — `tokens.css` mantiene sincronía. |
| `animation.css` | Tokens de animación: duraciones, curvas de easing, base de stagger, gradientes de overlay, elevación hover, tokens de interacción de botones. Además contiene los keyframes y las utility classes de animación. |

### Categorías de tokens

Cada categoría tiene un propósito claro y una convención de nombres:

**Color**
- Paleta base: primary, secondary, accent, neutral (9 niveles), surface.
- Cada color tiene variantes light/dark para hover y active states.
- Los neutrals usan escala numérica (50→900) siguiendo el estándar de Tailwind.

**Tipografía**
- font-sans y font-heading definen las familias.
- font-size-* escala desde 2xs hasta 5xl, con nombres semánticos (body, lg) además de los numéricos.
- font-weight-* y leading-* completan el sistema tipográfico.

**Espaciado**
- space-* escala en múltiplos de 0.25rem (4px), siguiendo la escala de Tailwind.
- spacing-* es un alias para generar utilidades Tailwind en HTML (ej: p-18). Es duplicación intencional.

**Border radius**
- radius-xs, radius-sm, radius-lg, radius-card, radius-full.
- Nombres semánticos: card es el radio estándar de cards, sm el de botones.

**Sombras**
- shadow-sm a shadow-2xl, seis niveles de profundidad.
- Se combinan con elevación semántica (elevation-hover-strong, elevation-dropdown, etc.) que expresa función, no intensidad.

**Z-index**
- Seis niveles: mobile-nav, header, dropdown, modal, toast, skip-link.
- Valores elegidos para dejar espacio entre niveles sin números gigantes.

**Focus ring**
- Tres variantes: standard (2px, offset 2px), thick (para botones, offset 3px), inverse (blanco sobre fondos oscuros).
- Todos los componentes del sitio usan estos tokens compartidos.

**Animación**
- Duración: 7 niveles desde instant (100ms) hasta entrance (900ms).
- Easing: tres curvas (in, out, spring) compartidas por todas las animaciones.
- Stagger base: un único valor (100ms) que controla el ritmo de entradas secuenciales.

**Elevación semántica**
- En vez de elegir shadow-2 o shadow-3, los componentes usan nombres como elevation-rest-default, elevation-hover-strong, elevation-modal.
- La implementación concreta (qué sombra es cada una) se puede cambiar sin tocar los componentes.

---

## Cómo agregar nuevos tokens

### Regla general

Antes de agregar un token, preguntar: **"Este valor se necesita en más de un lugar?"** Si la respuesta es sí, es candidato a token. Si es un valor único de un componente específico, probablemente no.

### Proceso

1. **Identificar la categoría correcta.** Un color va en la sección de colores, no en tipografía. Si no existe una categoría que lo contenga, crear una nueva sección con su comentario de apertura.

2. **Agregar el token en `_tokens.css`** (el canónico) con un comentario que explique qué es, para qué sirve, y cómo se usa. Incluir advertencias si aplica (por ejemplo, "no usar directamente — preferir la variante semántica X").

3. **Sincronizar en `tokens.css`** copiando el token sin los comentarios extensos (sí mantener un comentario corto de categoría).

4. **Actualizar el resto del códigobase.** Buscar usos del valor hardcodeado y reemplazarlos por el nuevo token. Cada componente que usaba el valor literal ahora referencia el token.

### Qué debe incluir cada token nuevo

- Un nombre que exprese propósito o función, no apariencia.
- Un valor por defecto que tenga sentido en el contexto del sistema actual.
- Un comentario en el canónico que explique su uso esperado.

---

## Buenas prácticas

### Nomenclatura

- Usar nombres semánticos, no literales. `--color-primary` en vez de `--color-rose`. `--radius-card` en vez de `--radius-12`.
- Mantener el prefijo de categoría: `--color-*`, `--font-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--elevation-*`, `--anim-*`, `--focus-ring-*`.
- Los modificadores van al final: `--color-primary-dark`, `--focus-ring-offset-thick`, `--elevation-hover-strong`.
- Excepciones documentadas: `--leading-*` existe fuera de `--font-*` porque Tailwind v4 lo exige así para generar utilidades. `--spacing-*` es duplicación intencional de `--space-*` para generar clases como `p-18` en HTML.

### Cuándo crear un token

- Un valor se repite en 2+ componentes → token.
- Un valor expresa una decisión de diseño (color de marca, espaciado estándar) → token.
- Un valor es candidato a cambiar en el futuro → token.
- Un valor es único de un componente y no representa una decisión de diseño global → no token. Dejarlo en el CSS del componente.

### Cuándo NO usar tokens

- Para valores contextuales de un solo componente que no representan una regla de diseño. Por ejemplo, un padding especial de un layout muy particular puede vivir en el CSS del componente sin problema.
- Para overrides de sistema como `forced-colors: active`. Los keywords del sistema (ButtonText, Canvas) no son reemplazables por tokens de diseño.

### Consistencia entre componentes

- No hardcodear `outline`, `border-radius`, o valores de espaciado en focus-visible. Usar los tokens de focus ring.
- No inventar nuevas duraciones de animación. Usar la escala existente (instant, fast, subtle, base, zoom, slow, entrance).
- No crear sombras nuevas. Usar la escala existente (sm a 2xl) o combinarla con elevación semántica.
- Si un componente necesita una variante que no existe (por ejemplo, un color primario más claro que light pero más oscuro que el base), evaluar si la solución es agregar un nuevo nivel a la escala o ajustar el componente para usar los niveles existentes.

### Mantenimiento

- Los tokens se definen en un solo lugar y se consumen en muchos. Cambiar un valor en `_tokens.css` (y sincronizar en `tokens.css`) lo actualiza en todos los componentes automáticamente.
- No duplicar valores. Si dos tokens tienen el mismo valor, verificar si realmente representan conceptos distintos. Si son el mismo concepto, unificar. Si son conceptos diferentes que casualmente tienen el mismo valor hoy, mantenerlos separados — el valor puede cambiar independientemente en el futuro.
- Los comentarios en `_tokens.css` son documentación viva. Si un token cambia de propósito o tiene restricciones de uso, actualizar el comentario.

### Relación con Tailwind

- Los tokens definidos dentro de `@theme` generan utilidades Tailwind automáticamente (bg-primary, text-neutral-800, font-heading, shadow-md).
- Los tokens que están fuera de `@theme` (focus-ring, elevación semántica) no generan utilidades Tailwind y se usan exclusivamente como variables CSS en los componentes.
- Usar las utilidades Tailwind en HTML cuando sea posible. Reservar las variables CSS directas para casos que Tailwind no cubre (pseudo-elementos, cálculos, media queries complejas, focus personalizado).
