Acá tenés el análisis completo del Design System, componente por componente.
1. Colores — 🟢 9/10
Consolidado en tokens.css:
- --color-primary (#b76e79) + light + dark
- --color-secondary + light
- --color-accent (#d4af37) + light
- --color-success, --color-warning, --color-error
- Neutral scale warm: 9 niveles (#50 → #900)
- Surfaces: --color-surface, --color-surface-subtle, --color-surface-contrast
Duplicado / no consolidado:
- ❌ #dc3545 y #28a745 hardcodeados en contact.css para errores/validación del wizard → --color-error es #c44a5c, distinto al rojo de validación. Hay dos rojos distintos.
- ❌ #25d366 y #1da851 hardcodeados en whatsapp-btn.ts, contact.css y promo.ts → el verde de WhatsApp no es un token.
2. Tipografía — 🟢 10/10
Consolidado:
- Familias: --font-sans: 'Inter', --font-heading: 'Playfair Display'
- Font weights: 5 niveles (light → bold)
- Line heights: 4 niveles (tight → relaxed)
- Font sizes: 12 niveles (xs → 4xl)
- Self-hosted woff2 → sin dependencias externas
Duplicado: Ninguno. Todos los componentes referencian los tokens. 👏
3. Spacing — 🟢 9/10
Consolidado en tokens.css:
- --space-1 hasta --space-24 (14 niveles)
- --spacing-18, --spacing-20, --spacing-24 extras
Duplicado:
- ❌ --space-0\.5 (0.125rem) usado en footer.css y testimonial-card.css pero NO definido como token. Existe inline.
- ❌ --space-3\.5 (0.875rem) en contact.css con fallback var(--space-3\.5, 0.875rem) → no es un token oficial.
4. Sombras — 🟢 10/10
Consolidado en tokens.css:
- 5 niveles de elevación (--elevation-0 a --elevation-5)
- Semántica completa: --elevation-rest-flat, --elevation-rest-subtle, --elevation-rest-default
- Semántica hover: --elevation-hover-subtle, --elevation-hover-default, --elevation-hover-strong
- Semántica floating: --elevation-element, --elevation-dropdown, --elevation-modal
- Contexto específico: --elevation-hero-btn, --elevation-wa-btn
Duplicado: Ninguno. Todos los componentes referencian los tokens. 👏
5. Animaciones — 🟢 9/10
Consolidado en animation.css:
- 3 easings: --anim-easing-in, --anim-easing-out, --anim-easing-spring
- 5 duraciones: instant (100ms) → entrance (900ms)
- 12 keyframes globales: fadeIn, slideUp, slideDown, slideLeft, slideRight, zoomIn, zoomOut, scaleIn, scaleUp, fadeInUp, popIn, lineGrowX/Y
- Utility classes: .anim-fade-in, .anim-slide-up, .anim-delay-*, .anim-hidden
- prefers-reduced-motion con 0.01ms !important
Duplicado / no consolidado:
- ❌ hero.css define heroZoom y heroSlideUp (keyframes específicos del hero que no aplican en otro lado — aceptable, pero heroSlideUp podría ser una variante paramétrica)
- ❌ contact.css define successCardIn, successPulse, shakeIn (2 de 3 son específicos, pero shakeIn se usa en 3 lugares de contact.css)
- ❌ pricing.css define rowIn
- ❌ gallery-grid.css define masonryIn
- ❌ floating-whatsapp.ts inline define floatIn
- Patrón: 5 keyframes inline que no están en animation.css. No son críticos (son específicos), pero rompen el principio de "único source of truth" del sistema de animación.
6. Botones — 🟡 7/10
Consolidado en styles.css:
- .btn → reset + layout + transiciones
- .btn-primary → fondo rosa + hover dark
- .btn-secondary → outline sutil
- Estados: hover, active, focus-visible, disabled, :active:not(:disabled) scale(0.97)
- High Contrast Mode y prefers-contrast: more
- Variables de interacción: --btn-transition, --btn-scale-hover, --btn-scale-active
Duplicado / no consolidado:
- ❌ hero.css define .hero .btn-primary y .hero .btn-secondary → overrides necesarios (fondo oscuro), pero repiten estilos del shared
- ❌ nav.css define .cta-nav y .cta-mobile → son botones pero con estilos propios (border, hover con translateY, colores que cambian según scroll)
- ❌ contact.css define .btn-nav, .btn-nav--back, .btn-nav--next, .btn-nav--submit, .whatsapp-cta → 5 variantes de botón inline en un solo componente
- ❌ whatsapp-btn.ts define 4 variantes inline: .wa-hero, .wa-footer, .wa-services, .wa-floating
- Hay 10+ variantes de botón (btn-primary, btn-secondary, hero/btn, cta-nav, cta-mobile, btn-nav--back, btn-nav--next, btn-nav--submit, whatsapp-cta, wa-hero, wa-footer, wa-services, wa-floating). Muchas comparten el mismo patrón (pill, icon+label, hover translateY, active scale) pero sin compartir CSS.
7. Cards — 🟡 7/10
Consolidado en styles.css:
- .card-base → bg surface, border-radius, shadow-sm, hover translateY(-4px)
- .card-lift → shadow-card, hover translateY(-6px)
- .card-media-zoom → imagen escala 1.06 en hover
- .card-entrance → slideUp con stagger delay via --card-delay
Duplicado / no consolidado:
- ❌ Padding inconsistente: service-card.css usa padding: var(--space-5) (1.25rem), team.css también padding: var(--space-5) (bien), pero testimonial-card.css usa padding: 0 var(--space-6) var(--space-6) (1.5rem solo horizontal/inferior). El card.ts compartido define .app-card-body con var(--space-5) — pero service-card y testimonial-card NO usan app-card-body, tienen su propio markup.
- ❌ Overlays duplicados: service-card y team-card definen .card-overlay con el mismo patrón (absolute + inset 0 + gradient overlay). Team usa --gradient-overlay (bien), service-card también. Testimonial-card define su propio overlay gradient inline.
- ❌ Aspect-ratio: service-card 4/3, team-card 1/1, testimonial-card 4/3 — sin variante compartida.
8. Inputs — 🔴 4/10
No hay sistema de inputs compartido.
- ❌ contact.css define estilos de input inline (.form-group :where(input, textarea)) con 142 líneas de CSS (hover, focus, focus-visible, placeholder, error, valid, disabled implícito)
- ❌ No hay un componente AppInput o AppTextarea compartido
- ❌ Los colores de validación (#dc3545, #28a745) no usan --color-error ni --color-success
- ❌ --radius-input está definido en tokens (8px) y se usa ✅, pero los estilos de focus ring están duplicados en cada formulario
- Si mañana necesitás un input nuevo, copiás 142 líneas de CSS.
9. Iconografía — 🟢 8/10
Consolidado:
- Componente SvgIcon en shared/components/svg-icon/ para SVG inline
- Se usa en: team, process, contact, cta-button, service-card, testimonial-card
No consolidado:
- ❌ Varios componentes tienen SVG inline directo (whatsapp-btn.ts, footer.html, nav.html) en vez de usar <app-svg-icon>
- ❌ SvgIcon maneja nombres de iconos tipados (SvgIconName), pero no hay un catálogo central de iconos disponibles
10. Responsive — 🟢 9/10
Consolidado:
- Todos los componentes usan @media (width >= ...) con valores en rem
- Breakpoints consistentes (referencia documentada en tokens.css) ✅
- Mobile-first: estilos base = mobile, media queries escalan ✅
Duplicado:
- ❌ Algunos breakpoints usan valores en px (@media (width < 420px) en whatsapp-btn.ts)
- ❌ hero.css y booking-cta.css tienen padding responsivo con @media (width >= 23.4375rem) (375px, iPhone SE) — padding específico que podría estar en utilities
- ❌ section-container y section-grid en styles.css ya definen padding responsive — pero hero y booking-cta no los usan, tienen su propio padding
11. Tokens — 🟢 10/10
@theme en tokens.css define:
- 16 colores, 2 familias, 5 weights, 4 line-heights, 12 font-sizes
- 8 radii, 8 shadows, 14 spacing levels, 3 container widths
- 5 elevation levels + 11 semantic aliases
- Todos referenciados como var(--color-*) o clases Tailwind
No consolidado: Nada significativo. Es el punto más fuerte del design system. 👏
12. Variables CSS — 🟢 9/10
Consolidado:
- --color-*, --font-*, --space-*, --shadow-*, --elevation-* → en tokens.css
- --anim-* (duration, easing, stagger) → en animation.css
- --btn-*, --gradient-overlay → en animation.css
- --container-content, --leading-* → en tokens.css
No consolidado:
- ❌ ContactComponent define --anim-delay como inline en HTML (.stagger-anim en styles.css hace lo mismo). La utility --card-delay y --anim-delay coexisten sin unificarse.
- ❌ Varios componentes usan color-mix(in srgb, ...) inline en vez de crear variables semánticas. Footer.css lo usa 6 veces, contact.css 8 veces.
13. Utilities — 🟢 8/10
Consolidado en styles.css:
- .section-padding, .section-container, .section-grid, .section-grid--cols-2
- .card-base, .card-lift, .card-media-zoom, .card-entrance
- .btn, .btn-primary, .btn-secondary
- .stagger, .stagger-anim (10 items cada uno)
- .section-divider, .section-gradient
- .anim-* (en animation.css, 12+ utility classes)
No consolidado:
- ❌ No hay utilities para .container (cada componente define su propio max-width + padding)
- ❌ No hay utilities para .grid-2, .grid-3 genéricas (section-grid existe pero es para 1→2→3)
- ❌ No hay utilities de margin/padding helper (como mt-4, gap-6) — se usa var(--space-*) en cada CSS, lo cual está bien pero requiere más código
- ❌ .skip-link está en styles.css (bien aislado) pero podria ser utility
Tabla resumen
Aspecto	Calificación	Consolidado	No consolidado
Colores	9/10	Paleta completa en tokens	#dc3545/#28a745 hardcodeados, verde WhatsApp no es token
Tipografía	10/10	Familias, escalas, self-hosted	—
Spacing	9/10	Escala completa	--space-0.5 y --space-3.5 no son tokens oficiales
Sombras	10/10	Elevación semántica completa	—
Animaciones	9/10	Easings, duraciones, 12 keyframes, utility classes, reduced-motion	5 keyframes inline en componentes
Botones	7/10	.btn, .btn-primary, .btn-secondary, disabled, focus	10+ variantes de botón no compartidas
Cards	7/10	.card-base, .card-lift, .card-entrance	Padding inconsistente, overlays duplicados
Inputs	4/10	--radius-input en tokens	No hay sistema de inputs compartido — 142 líneas de CSS en un solo componente
Iconografía	8/10	Componente SvgIcon tipado	SVG inline en varios componentes, sin catálogo central
Responsive	9/10	Breakpoints consistentes en rem, mobile-first	Algunos px sueltos, padding responsivo no unificado
Tokens	10/10	@theme completo	—
Variables CSS	9/10	Token system completo + animaciones	color-mix inline en vez de variables, --card-delay vs --anim-delay
Utilities	8/10	Section, card, btn, stagger, animation utilities	Sin container utility, sin grid helpers genéricos
Lo más fuerte del Design System
1. Sistema de elevación semántica (--elevation-rest-* / --elevation-hover-* / --elevation-floating-*) — excelente, pocos proyectos lo tienen así de pensado
2. Sistema de animación completo con duraciones, easings, keyframes, stagger y prefers-reduced-motion
3. Self-hosted fonts sin dependencia externa
4. Design tokens unificados en @theme que generan utilities de Tailwind automáticamente
Lo que necesita consolidación urgente
Prioridad	Problema	Solución
🔴 Alta	Inputs: 142 líneas de CSS inline en contact.css, sin componente compartido	Crear AppInputComponent + AppTextareaComponent en shared
🔴 Alta	Botones: 10+ variantes sin compartir CSS	Sistema de botones con variantes (hero, nav, wizard-back, wizard-next, whatsapp) exportado desde shared
🟡 Media	Keyframes inline: 5 keyframes fuera de animation.css	Mover shakeIn, masonryIn, rowIn a animation.css como utilidades compartidas
🟡 Media	Padding de cards inconsistente: 1.25rem vs 1.5rem	Unificar en --space-5 y usar .app-card-body del CardComponent compartido
🟡 Media	Colores hardcodeados: #dc3545, #25d366	Definir tokens --color-error-soft, --color-brand-whatsapp
🟢 Baja	--space-0.5 y --space-3.5 faltan en la escala	Agregarlos a tokens.css
🟢 Baja	Iconos SVG inline en vez de <app-svg-icon>	Migrar a SvgIconComponent en todos los lugares