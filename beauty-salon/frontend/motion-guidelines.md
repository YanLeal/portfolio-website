# Motion Guidelines — Belleza & Estilo

Cada animación existe para guiar la atención, confirmar una acción, o conectar una transición. Si no cumple uno de esos tres propósitos, no se anima.

```css
/* Tokens disponibles (definidos en styles/animation.css) */
--anim-duration-instant: 100ms;
--anim-duration-fast:   200ms;
--anim-duration-base:   400ms;
--anim-duration-slow:   700ms;
--anim-duration-entrance: 900ms;

--anim-easing-in:    cubic-bezier(0.4,   0,   0.68, 0.06);  /* entrada suave */
--anim-easing-out:   cubic-bezier(0.16,  1,   0.3,  1);     /* respuesta natural */
--anim-easing-spring:cubic-bezier(0.34,  1.56, 0.64, 1);    /* énfasis juguetón */
```

---

## 1. Durations

Cada escala tiene un contexto claro. No inventes duraciones nuevas sin revisar con el equipo.

| Token | Valor | Cuándo usarlo |
|---|---|---|
| `--anim-duration-instant` | 100ms | Feedback táctil: `:active`, toggle check, micro-interacción que debe sentirse inmediata |
| `--anim-duration-fast` | 200ms | Hover, focus, color transitions, tooltips. Lo suficientemente rápido para no sentir espera |
| `--anim-duration-base` | 400ms | Cambios de estado, acordeones, show/hide de elementos pequeños. La duración "por defecto" |
| `--anim-duration-slow` | 700ms | Entradas de sección, cards en lista, cambios de contenido notables |
| `--anim-duration-entrance` | 900ms | Hero, primeras impresiones, animaciones que marcan el ritmo de la página |

### Regla de velocidad

> Si el usuario está esperando para interactuar → 200ms o menos.
> Si el usuario ya está viendo y procesando → 400-700ms.
> Si es parte de una experiencia coreográfica → hasta 900ms.

Nunca más de 1 segundo para una animación completa. El usuario no debería notar que "algo está animando"; debería notar que "la interfaz fluye".

---

## 2. Easing Curves

Usar el easing incorrecto es el error más común y el que más "barato" se siente.

### `--anim-easing-out` — la curva por defecto (cubic-bezier(0.16, 1, 0.3, 1))

```
▁▁▁▁▂▄▆▇██
```

Aceleración natural, como si un objeto respondiera a la gravedad. Se siente orgánico, no robótico.

- Hover effects
- Card lift / shadow
- Entradas de sección (`fadeInUp`, hero)
- Cualquier cosa que responda al usuario

Es la curva default del proyecto. Si dudas, usá esta.

### `--anim-easing-in` — para salidas (cubic-bezier(0.4, 0, 0.68, 0.06))

```
██▇▆▄▂▁▁▁▁
```

Comienza rápido, desacelera al final. Útil para cosas que desaparecen: no querés que el usuario espere a que termine para ver qué viene después.

- Elementos que salen del DOM
- Notificaciones descartadas
- Overlays cerrando

### `--anim-easing-spring` — el resorte (cubic-bezier(0.34, 1.56, 0.64, 1))

```
▁▁▃▆████▇▆▅▄▃▂▁
```

Sobre-pasa el destino y vuelve. Sensación elástica y juguetona. **Usar con moderación — 1 o 2 veces por página como máximo.**

- Hamburguer menu de header (el que ya tienen ✅)
- Números en las stats del About
- Loader de "turno enviado con éxito"

### Regla de aceleración

> **Nunca** uses `ease-in` para algo que entra o responde al usuario.
> **Nunca** uses `ease-out` para algo que desaparece.
> **Nunca** uses `linear` en producción (excepto colores/opacidad y es raro).

---

## 3. Velocidad por interacción

Cada tipo de interacción tiene un rango de velocidad recomendado.

| Interacción | Duración | Easing |
|---|---|---|
| `:active` / click | 100ms | — (instantáneo) |
| `:hover` texto | 200ms | ease (default) |
| `:hover` card lift | 400-450ms | `--anim-easing-out` |
| Focus ring | 200ms | ease |
| Underline animado | 300ms | `--anim-easing-out` |
| Card image zoom | 600ms | `--anim-easing-out` |
| Stagger entrada (por item) | 700ms | `--anim-easing-out` |
| Intervalo entre staggers | 80-120ms | — |
| Hero entrance (por elemento) | 900ms | `--anim-easing-out` |
| Hero retardo total | 1.8s (último elemento) | — |
| Scroll indicator | 2.5s (loop infinito) | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Menú mobile abrir/cerrar | 300ms | spring / ease-out |
| Wizard step transition | 350ms | `--anim-easing-out` |
| Loading / skeleton | 1.5-2s (loop) | ease-in-out |

> Los intervalos de stagger deben ser consistentes en todo el proyecto: **100ms**. No 80 en una lista y 120 en otra. La consistencia es lo que hace que el sistema se sienta coherente.

---

## 4. Fade

### Cuándo usarlo

| Situación | Ejemplo |
|---|---|
| Elemento que aparece/desaparece sin cambiar de posición | Overlay de carga, skeleton screen |
| Transición entre estados del mismo elemento | Wizard step que se reemplaza por otro |
| Elemento decorativo que no debe llamar la atención | Background parallax sutil |
| Salida de cualquier elemento | Notificación que se va |

### Cómo usarlo

```css
/* Entrada */
.element {
  animation: fadeIn var(--anim-duration-base) var(--anim-easing-out) both;
}

/* Salida */
.element-exit {
  animation: fadeIn var(--anim-duration-fast) var(--anim-easing-in) reverse both;
}

/* Keyframe global ya disponible */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Reglas Fade

- Nunca uses fade solo para elementos importantes — combinálo con slide o scale.
- Fade sin movimiento se siente plano. Si algo merece aparecer, merece moverse.
- Salidas siempre más rápidas que entradas (fast vs base).
- Para overlays modales: fondo fade 200ms, contenido slide-up 400ms.

---

## 5. Scale

### Cuándo usarlo

| Situación | Ejemplo |
|---|---|
| Feedback de que algo es presionable | `button:active { transform: scale(0.97) }` |
| Énfasis en hover | Card image zoom, botón que crece |
| Atención a un elemento importante | Hero CTA, estado de éxito |
| Elemento que "late" o espera atención | Indicador de notificación, badge |

### Cómo usarlo

```css
/* Press feedback (ya global en styles.css ✅) */
button:active:not(:disabled),
a:active:not(:disabled) {
  transform: scale(0.97);
}

/* Image zoom en card hover */
.card-media-zoom img {
  transition: transform 0.6s var(--anim-easing-out);
}
.card-media-zoom:hover img {
  transform: scale(1.06);
}

/* CTA emphasis */
.btn-primary:hover {
  transform: scale(1.03);
  transition: transform var(--anim-duration-fast) var(--anim-easing-spring);
}
```

### Reglas Scale

- Nunca más de `1.1` en hover (queda caricaturesco).
- Scale down en press: `0.97` es el estándar del proyecto. No inventes otro valor.
- Scale + opacity juntos se ven naturales. Scale solo se ve mecánico.
- En elementos de texto, usá scale con mucho cuidado (el texto borroso se ve mal).
- Imágenes: `1.06` en hover, transición de 600ms para que sea suave.

---

## 6. Slide

### Cuándo usarlo

| Situación | Ejemplo |
|---|---|
| Elemento que entra desde una dirección específica | Panel mobile desde la derecha |
| Lista que aparece secuencialmente | Cards de servicios con stagger |
| Navegación entre pasos | Wizard: paso nuevo entra desde la derecha, viejo sale hacia la izquierda |
| Sección que entra al hacer scroll | Hero content, about, cada sección |
| Menú / dropdown / panel que se despliega | Nav mobile overlay |

### Cómo usarlo

```css
/* Direcciones semánticas:
   - Adelante en el flujo: slide from right (next)
   - Atrás en el flujo: slide from left (prev)
   - Arriba: elementos que aparecen al hacer scroll (entrada natural)
   - Abajo: notificaciones, elementos que caen
*/

/* Entrada desde abajo (scroll) — fadeInUp ya existe en animation.css ✅ */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(1.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Panel mobile desde la derecha */
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

/* Wizard: siguiente paso */
@keyframes slideInNext {
  from {
    opacity: 0;
    transform: translateX(2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Wizard: paso anterior */
@keyframes slideInPrev {
  from {
    opacity: 0;
    transform: translateX(-2rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Reglas Slide

- Distancia máxima: `2rem` para elementos de UI, `10rem` para elementos decorativos.
- Siempre combiná slide con fade. Slide sin fade se siente mecánico.
- Slide desde abajo = elemento que "emerge" naturalmente.
- Slide desde arriba = elemento que "cae" (solo para alerts/notificaciones importantes).
- Slide lateral = navegación, paneles direccionales.
- **Nunca** uses slide horizontal para elementos que aparecen por scroll (la dirección natural de scroll es vertical).

---

## 7. Cuándo NO usar animaciones

### `prefers-reduced-motion` — siempre activo

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Ya está implementado en `animation.css` ✅. No tocarlo.

### Casos concretos donde no se anima

| Situación | Por qué |
|---|---|
| **Errores de formulario** | El usuario necesita ver el error inmediatamente para corregirlo. Cualquier retardo frustra. |
| **Mensajes de estado crítico** ("Turno no disponible") | Lo mismo que errores — la urgencia del mensaje exige inmediatez. |
| **Elementos above the fold que ya son visibles** | No tiene sentido animar algo que el usuario ya ve. Solo hero entrance (es coreográfico). |
| **Loading skeleton en primer paint** | El skeleton no debe animarse hasta que tenga contenido. El fade-in del contenido real sí. |
| **Transiciones que tardan más de 1 segundo** | Si no entra en 1s, no es una animación, es una espera. Repensá el diseño. |
| **Scroll hijacking** | Nunca animar el scroll del usuario. Él controla, no nosotros. |
| **Elementos que aparecen para informar una acción completada** | Por ejemplo: "Mensaje enviado ✅". Debe aparecer instantáneo, no desvanecerse. |
| **Cuando el dispositivo está en modo ahorro de batería** | No podemos detectarlo con CSS, pero `prefers-reduced-motion` suele estar activo en estos casos. |
| **Contenido principal que el usuario vino a leer** | No animar títulos de artículos, párrafos de texto, precios. |
| **Listas de más de 20 elementos** | Stagger en listas largas se siente lento. Solo animar los primeros 8-10. |

### El principio general

> Animá la interacción, no el contenido.

Si el usuario hizo clic en "Reservar turno", animá el botón para confirmar que se registró el clic. No animés el formulario que aparece — mostralo rápido para que pueda usarlo.

---

## 8. Guía rápida de tecnología

| Qué animar | Tecnología | Estado |
|---|---|---|
| Hover, focus, active, color | CSS Transitions | ✅ Implementado |
| Card lift + shadow | CSS Transitions | ✅ Implementado |
| Hero entrance | CSS Animations | ✅ Implementado |
| Section entrances (scroll) | CSS Animations | ✅ Implementado |
| Stagger de listas | Angular Animations (`stagger()`) | 🔜 Pendiente |
| Wizard step transitions | Angular Animations (`:enter/:leave`) | 🔜 Pendiente |
| Route transitions | View Transitions API | ❌ No aplica aún |

---

## Checklist para review de animaciones

- [ ] ¿Tiene un propósito claro (guiar, confirmar o conectar)?
- [ ] ¿Usa un token de duración existente? (no valores mágicos)
- [ ] ¿Usa el easing correcto para la dirección (out para entrar, in para salir)?
- [ ] ¿Tiene `will-change` solo cuando hay jank? (nunca en selector global)
- [ ] ¿Respeta `prefers-reduced-motion`?
- [ ] ¿La duración es < 1s?
- [ ] ¿El stagger es consistente (100ms)?
- [ ] ¿No anima errores o estados críticos?
- [ ] ¿Combinó fade + slide en vez de solo uno?

---

> Este documento es el source of truth para decisiones de animación. Si una animación no está contemplada acá, no se implementa hasta que se actualice esta guía.
