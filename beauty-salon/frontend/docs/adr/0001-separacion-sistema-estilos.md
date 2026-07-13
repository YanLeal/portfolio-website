# ADR-0001: Separación del Sistema de Estilos

- **Fecha:** 2026-07-13
- **Estado:** Aceptada

---

## Problema

El archivo `styles.css` se había convertido en un monolito que mezclaba responsabilidades distintas: reseteo de navegador, variables de diseño, utilidades de layout, animaciones, componentes reutilizables (cards, botones), y micro-interacciones globales. Con más de 360 líneas, cualquier cambio requería leer el archivo completo para entender qué existía ya, lo que llevaba a:

- **Contaminación entre capas.** Una regla de reseteo podía aparecer junto a una utilidad de grid o un estilo de botón, sin separación clara.
- **Duplicación inadvertida.** Como no había un lugar obvio para cada cosa, era fácil agregar una segunda definición del mismo concepto en otra parte del archivo.
- **Dificultad para incorporar desarrolladores nuevos.** Sin un mapa mental de la organización, contribuir al sistema de estilos requería estudio previo del archivo entero.
- **Riesgo de regresiones.** Cambiar una sección podía afectar otra sin relación porque no había fronteras explícitas entre responsabilidades.
- **Tokens de diseño sin autoridad.** Aunque existían variables definidas, ningún mecanismo impedía que los componentes saltaran los tokens y hardcodearan valores.

---

## Alternativas

### Alternativa A: Mantener el monolito (status quo)

Seguir agregando reglas en `styles.css` a medida que el sitio creciera. La ventaja aparente era la simplicidad de un solo archivo. Pero esa simplicidad era ilusoria: el archivo ya tenía más de 360 líneas y cada nueva funcionalidad lo empeoraba.

### Alternativa B: Dividir por tamaño

Cortar el archivo en fragmentos arbitrarios basados en líneas (primer tercio, segundo tercio, etc.). Esto resolvía el tamaño del archivo pero no creaba fronteras semánticas. La organización seguiría siendo caótica, solo que repartida en varios archivos.

### Alternativa C: Dividir por responsabilidad (elegida)

Separar el sistema en archivos con responsabilidades únicas y excluyentes:

- **Tokens:** solo valores atómicos (color, espaciado, tipografía, sombras, radios). Sin reglas de componentes.
- **Reset:** solo reseteo de navegador y estilos base de elementos HTML. Sin clases utilitarias.
- **Utilities:** solo clases de layout y estructura (grids, contenedores, stagger). Sin componentes.
- **Animation:** solo keyframes, tokens de animación, y clases de animación. Sin layout.
- **styles.css:** solo componentes compartidos (cards, botones) y micro-interacciones globales. Sin resets, sin tokens, sin layout.

### Alternativa D: CSS Modules por componente desde el inicio

Migrar todo el sitio a CSS Modules embebidos en cada componente Angular. Esto era conceptualmente más puro pero implicaba un cambio estructural enorme, riesgo de regresiones visuales en todo el sitio, y pérdida de la capacidad de compartir estilos entre componentes sin repetir reglas.

---

## Decisión

Se adoptó la **Alternativa C: dividir por responsabilidad**. La estructura resultante es:

| Archivo | Responsabilidad |
|---|---|
| `_tokens.css` | Tokens canónicos con documentación detallada. No se importa directamente. |
| `tokens.css` | Copia sincronizada de los tokens, sí importada por `styles.css`. |
| `reset.css` | Reseteo de navegador y estilos base de elementos HTML. |
| `utilities.css` | Clases de layout: section-padding, section-container, section-grid, section-gradient, section-divider, stagger. |
| `animation.css` | Tokens de animación, keyframes, utility classes de animación, reduced-motion. |
| `styles.css` | Punto de entrada. Importa los archivos anteriores y contiene micro-interacciones base, skip-link, cards, y botones. |

### Criterios que gobernaron la decisión

1. **Responsabilidad única.** Cada archivo tiene un propósito que se puede explicar en una línea. No hay ambigüedad sobre dónde va una regla nueva.
2. **Sin cambio visual.** La separación es exclusivamente organizativa. Los valores, las clases, y el comportamiento visual son idénticos. Ningún componente se modificó.
3. **Migración gradual.** No se requirió una reescritura masiva. Cada sección se extrajo de `styles.css` a su archivo correspondiente, una por una, validando con build entre cada paso.
4. **Token como autoridad.** El sistema de tokens pasó de ser una colección de variables a ser la fuente de verdad del diseño. Todos los componentes deben referenciar tokens en vez de hardcodear valores.

---

## Consecuencias

### Positivas

- **Reducción de tamaño.** `styles.css` pasó de más de 360 líneas a 228, y cada archivo extraído tiene un tamaño manejable y un propósito claro.
- **Descubrimiento inmediato.** Un desarrollador nuevo sabe que los resets están en `reset.css`, las utilidades en `utilities.css`, los tokens en `tokens.css`. No necesita leer todo para encontrar lo que busca.
- **Eliminación de duplicación.** El proceso de extracción reveló duplicación entre `.stagger` y `.stagger-anim`, y entre `--card-delay` y `--anim-delay`, que se consolidaron.
- **Centralización del focus ring.** Donde antes cada componente hardcodeaba su outline, ahora todos referencian los tokens `--focus-ring-outline`, `--focus-ring-offset`, `--focus-ring-outline-inverse`.
- **Base para el diseño systema.** La estructura de archivos y el vocabulario de tokens ahora pueden documentarse (ver `docs/design-system.md`) y servir como referencia para decisiones futuras de diseño.

### Negativas

- **Archivo espejo.** `_tokens.css` y `tokens.css` deben mantenerse sincronizados. `_tokens.css` es el canónico con documentación; `tokens.css` es el operativo que se importa. Un cambio en el canónico que no se refleje en el operativo causa divergencia.
- **Más archivos.** Aumentar la cantidad de archivos tiene un costo cognitivo menor (cada uno es simple) pero real: cinco archivos de estilos en vez de uno. Esto se mitiga con la convención de nombres clara.

### Neutrales

- **Sin impacto visual.** Ningún usuario nota la diferencia. La separación es exclusivamente organizativa y para mantenibilidad a largo plazo.
- **Los componentes existentes no cambiaron.** Cards, botones, nav, footer, formularios, testimonials, services, team, pricing, process, contact — todos referencian las mismas variables CSS que antes, solo que ahora esas variables están definidas en archivos separados.

---

## Notas adicionales

- Esta ADR documenta la estructura de archivos hasta julio 2026. La extracción de `animation.css` fue anterior a esta decisión y se mantiene como estaba.
- Las decisiones de nomenclatura de tokens (prefijos `--color-*`, `--font-*`, `--space-*`, etc.) y las excepciones documentadas (`--leading-*`, `--spacing-*`) son parte de la arquitectura pero se detallan en `docs/design-system.md` para no duplicar información.
