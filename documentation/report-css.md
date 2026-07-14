Acá tenés el reporte completo de CSS.
Reporte de CSS — Belleza & Estilo
1. Totales
Métrica
Archivos .css
Archivos con CSS inline (en .ts)
Líneas totales
Líneas en styles/ (sistema)
Líneas en componentes (features)
Líneas en layout
Líneas en shared
Líneas inline en .ts
Archivo más grande
Archivo más pequeño
Desglose por archivo:
Archivo
contact.css
styles.css (entry)
hero.css
animation.css
footer.css
nav.css
whatsapp-btn.ts (inline)
tokens.css
about.css
testimonial-card.css
team.css
service-card.css
gallery-grid.css
header.css
card.css
pricing.css
cta-button.css
promo.css
booking-cta.css
floating-whatsapp.ts (inline)
section-header.css
fonts.css
process.css
services.css
gallery.css
testimonials.css
app.css
2. Variables CSS
Definidas en tokens.css + animation.css: ~92 variables
Categoría	Cantidad	Ejemplos
Colores	23	--color-primary, --color-neutral-50…900, --color-surface, --color-accent-light
Tipografía	14	--font-sans, --font-heading, --font-weight-*, --leading-*, --font-size-*
Espaciado	16	--space-1…--space-24, --spacing-18…24
Sombras	8	--shadow-sm, --shadow-card, --shadow-lg, --shadow-xl, --shadow-2xl
Elevación	16	--elevation-0…5, --elevation-rest-*, --elevation-hover-*, --elevation-*
Animación	10	--anim-duration-* (7), --anim-stagger-base, --anim-easing-* (3)
Radios	8	--radius-sharp, --radius-sm, --radius-card, --radius-input, --radius-lg, etc.
Otros	5	--btn-transition, --btn-scale-hover, --btn-scale-active, --gradient-overlay, --container-content
USO de variables por archivo:
Se usan en los 25 archivos CSS + 2 inline. El sistema de variables es sólido y consistente — casi ningún valor hardcodeado escapa al sistema de tokens.
Excepciones (valores hardcodeados que deberían ser variables):
Archivo	Valor hardcodeado
contact.css	#dc3545 (rojo error, usado 9 veces)
contact.css	#28a745 (verde validación, usado 5 veces)
whatsapp-btn.ts	#25d366, #1da851 (verde WhatsApp)
hero.css	rgba(36, 31, 26, 0.82) (overlay, 3 stops)
booking-cta.css	rgba(24, 20, 16, 0.88) (overlay, 3 stops)
team.css	rgba(255, 255, 255, 0.2) (social button bg)
footer.css	color-mix(in srgb, var(--color-surface) 70%, transparent) (repetido 6 veces)
whatsapp-btn.ts	420px (media query)
3. Keyframes
Totales: 25 keyframes
Origen	Cantidad	Keyframes
animation.css (global)	14	fadeIn, fadeOut, slideUp, slideDown, slideLeft, slideRight, zoomIn, zoomOut, scaleIn, scaleUp, fadeInUp, popIn, lineGrowY, lineGrowX
hero.css	3	heroZoom, heroSlideUp, scrollDot
contact.css	3	successCardIn, successPulse, shakeIn
promo.css	2	shimmer, float
pricing.css	1	rowIn
gallery-grid.css	1	masonryIn
floating-whatsapp.ts (inline)	1	floatIn
Problema: 11 de 25 keyframes (44%) están definidos inline en componentes en vez de en animation.css. El sistema global debería ser el único source of truth. Keyframes como shakeIn y masonryIn son reutilizables — podrían estar en el sistema global.
4. Media Queries
63 media queries en .css + 4 en inline .ts = 67 totales
Breakpoints detectados:
Breakpoint	Equivalente	Archivos que lo usan
width >= 23.4375rem	375px (iPhone SE)	hero.css, header.css, contact.css
width >= 30rem	480px (phone wide)	hero.css, about.css, contact.css, gallery-grid.css
width >= 40rem	640px (tablet small)	styles.css, footer.css, gallery-grid.css
width >= 48rem	768px (tablet wide)	styles.css, header.css, hero.css, about.css, contact.css, booking-cta.css, section-header.css, team.css, service-card.css, footer.css, gallery-grid.css
width >= 64rem	1024px (desktop)	styles.css, header.css, nav.css, hero.css, footer.css, gallery-grid.css
width >= 80rem	1280px (wide)	hero.css
width < 30rem	< 480px	about.css, contact.css, gallery-grid.css
width < 48rem	< 768px	about.css
width >= 480px	(px, no rem)	whatsapp-btn.ts
width >= 640px	(px, no rem)	whatsapp-btn.ts
width >= 420px and < 640px	(px, no rem)	whatsapp-btn.ts
width < 420px	(px, no rem)	whatsapp-btn.ts
(forced-colors: active)	—	styles.css
(prefers-contrast: more)	—	styles.css
(prefers-reduced-motion: reduce)	—	animation.css
Problemas detectados:
1. ❌ 4 breakpoints en px en vez de rem en whatsapp-btn.ts (480px, 640px, 420px). En hero.css usan 23.4375rem para el mismo valor — inconsistencia.
2. ❌ width < 30rem se usa en 3 archivos distintos con propósitos distintos — en about.css colapsa stats grid, en contact.css oculta labels del wizard, en gallery-grid.css fuerza caption visible
3. ❌ La @media (width >= 640px) and (width < 1024px) en floating-whatsapp.ts no sigue la convención de breakpoints del proyecto
5. Sombras
Uso de tokens de sombra por tipo:
Token	Dónde se usa
--shadow-sm	styles.css (card-base), contact.css (service-option:hover), header.css (.solid)
--shadow-card	styles.css (card-lift)
--shadow-lg	about.css (about-media), styles.css (elevation-hover-base)
--shadow-xl	nav.css (panel), animation.css (elevation-hover-strong)
--shadow-2xl	animation.css (elevation-modal)
--elevation-hover-subtle	about.css (stat-card:hover)
--elevation-hover-base	styles.css (card-base:hover), gallery-grid.css (figure:hover)
--elevation-hover-strong	styles.css (card-lift:hover)
--elevation-hero-btn	hero.css
--elevation-wa-btn	whatsapp-btn.ts
Inline / hardcodeado	service-card.css: 0 2px 8px rgba(36,31,26,0.12) para el icono flotante
Conclusión: Uso de sombras casi perfecto. Solo un inline shadow en service-card.css que podría ser un token nuevo (--elevation-icon-badge).
6. Spacing
Uso de --space-* por token:
Token	Valor
--space-1	0.25rem
--space-1\.5	0.375rem
--space-2	0.5rem
--space-3	0.75rem
--space-4	1rem
--space-5	1.25rem
--space-6	1.5rem
--space-8	2rem
--space-10	2.5rem
--space-12	3rem
--space-16	4rem
--space-20	5rem
--space-24	6rem
Tokens faltantes (usados inline pero sin definición oficial):
Uso inline
--space-0\.5 (0.125rem)
--space-3\.5 (0.875rem)
gap: 0
gap: 0.2rem
gap: 0.375rem
gap: 0.5rem
gap: 0.625rem
gap: 0.75rem
Problema: gap: 0.5rem es --space-2 — se usa en 7 lugares pero a veces como gap: 0.5rem en vez de var(--space-2). Hay pequeñas inconsistencias.
7. Border Radius
Uso de --radius-* por tipo:
Token	Valor	Dónde se usa
--radius-sharp	2px	hero.css (botones), booking-cta.css, service-card.css, whatsapp-btn.ts (hero/services)
--radius-sm	4px	styles.css (.btn, .cta-nav), cta-button.css, nav.css (.cta-mobile)
--radius-card	8px	styles.css (.card-base), contact.css (service-option, closed-day, review-card), team.css (focus), about.css (stat-card), gallery-grid.css (figure)
--radius-input	8px	contact.css (inputs)
--radius-lg	12px	about.css (.about-media), about.css (.about-media-accent), gallery-grid.css (figure:hover)
--radius-xl	16px	—
--radius-2xl	24px	—
--radius-full	9999px	contact.css (time-slot), whatsapp-btn.ts (floating), contact.css (social-icon), footer.css (social-link), team.css (social-link)
Problemas: Ninguno significativo. Uso consistente de los tokens de radio.
8. Clases Repetidas / Duplicidad
Patrones duplicados identificados:
🔴 Botones — 10+ variantes sin compartir
Clase
.btn + .btn-primary + .btn-secondary
.hero .btn-primary + .hero .btn-secondary
.cta-nav
.cta-mobile
.btn-nav + --back + --next + --submit
.whatsapp-cta
.wa-link + 4 variantes
.card-btn
Total: ~480 líneas de CSS para botones, 8 implementaciones separadas.
🟡 Social icons — 3 implementaciones casi idénticas
Archivo	Clase	Diámetro
footer.css	.social-link	2.25rem
contact.css	.social-icon	2.25rem
team.css	.social-link	2.5rem
Mismo patrón, valores similares, 3 implementaciones distintas.
🟡 Gradient overlays — 4 implementaciones
Archivo	Gradiente
animation.css	--gradient-overlay
hero.css	Multi-stop (82% → 5%)
booking-cta.css	Left-to-right (88% → 40%)
testimonial-card.css	Bottom-to-top (10% → 3% → surface)
🟢 Card base styles — Parcialmente compartidas
.card-base y .card-lift están en styles.css ✅, pero cada card component tiene sus propios .card-media, .card-overlay, .card-body, .card-title con paddings que varían entre --space-5 (1.25rem) y 1.5rem.
🟡 border-radius: 50% + width/height para círculos
Aparece en 7 lugares distintos: footer.css, contact.css (x2: social-icon, progress-circle), team.css (social-link, progress-circle), service-card.css (card-icon), whatsapp-btn.ts (wa-footer). Podría ser una utility .circle-*.
9. Utilidades
Definidas en styles.css:
Utilidad
.section-padding
.section-container
.section-grid
.section-grid--cols-2
.card-base
.card-lift
.card-media-zoom
.card-entrance
.stagger
.stagger-anim
.btn / .btn-primary / .btn-secondary
.section-divider
.section-gradient
.skip-link
Definidas en animation.css:
Utilidad
.anim-fade-in (y variantes fast/slow)
.anim-fade-out
.anim-slide-up/down/left/right
.anim-zoom-in/out
.anim-scale-in/up
.anim-fade-in-up
.anim-pop-in
.anim-line-grow-y/x
.anim-hidden
.anim-delay-1…8
Utilidades faltantes:
- No hay una utility .container genérica (cada componente define su propio max-width + padding)
- No hay utilities de grid genéricas (.grid-2, .grid-3)
- No hay utilities de circle (.circle-sm, .circle-md, .circle-lg)
- No hay utilities de texto (.text-gradient, .text-truncate, .text-balance)
10. Prioridades de Refactor
Prioridad	Qué	Por qué
P1 🔴	Unificar sistema de botones	10+ variantes en 8 archivos (~480 líneas). Cada variante nueva requiere copiar el patrón.
P2 🔴	Crear componente AppInput compartido	contact.css tiene 142 líneas de estilos de input que no se reutilizan en ningún otro lado. Cuando aparezca un segundo formulario, se copian.
P3 🟡	Mover keyframes inline al sistema global	11 de 25 keyframes (44%) están en componentes. shakeIn y masonryIn son reutilizables.
P4 🟡	Unificar social icons	3 implementaciones casi idénticas (footer, contact, team). Crear utility .social-icon o componente compartido.
P5 🟡	Estandarizar breakpoints	4 breakpoints en px en whatsapp-btn.ts. Usar rem como el resto del proyecto.
P6 🟡	Agregar tokens faltantes	--space-0.5, --space-3.5, --color-error-soft, --color-brand-whatsapp, --color-on-dark helper
P7 🟢	Migrar overlays de gradiente a tokens	4 implementaciones de overlay gradiente. El token --gradient-overlay ya existe, hero y booking-cta no lo usan.
P8 🟢	Unificar padding de cards	service-card (1.25rem) vs testimonial-card (1.5rem). Usar --space-5 en todas.
P9 🟢	Crear utility .container genérica	6 componentes repiten max-width: var(--container-content); margin-inline: auto; padding-inline: ...
P10 🟢	Unificar variantes de WhatsApp button	whatsapp-btn.ts y floating-whatsapp.ts son esencialmente el mismo componente con diferente variant
Resumen Visual
CSS Health Dashboard
═══════════════════════════════════════════════
Variables CSS        ████████████████████░  96%  (muy bien, 4 valores inline)
Keyframes            ██████████████░░░░░░  56%  (14/25 globales, 11 inline)
Breakpoints          ████████████████░░░░  78%  (4 px sueltos, resto rem)
Botones              █████░░░░░░░░░░░░░░░  35%  (10+ variantes, 8 archivos)
Inputs               ██░░░░░░░░░░░░░░░░░░  10%  (un solo componente, 142 líneas)
Cards                █████████░░░░░░░░░░░  55%  (base compartida, detalles no)
Social Icons         ██████░░░░░░░░░░░░░░  30%  (3 impls separadas)
Gradient Overlays    ████████░░░░░░░░░░░░  40%  (token existe, no todos lo usan)
Spacing Tokens       ██████████████████░░  85%  (2 valores inline sin token)
Sombras              ████████████████████  99%  (casi perfecto)
Border Radius        ████████████████████  98%  (excelente)
Utilities            ████████████████░░░░  72%  (faltan algunas genéricas)
═══════════════════════════════════════════
OVERALL              ████████████████░░░░  67%