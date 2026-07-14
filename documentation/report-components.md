Ahora sí, acá va el análisis completo de todos los componentes.
Tabla de Componentes
Root Component
Propiedad	App
Responsabilidad	Bootstrap root, scroll a fragmentos tras navegación
Inputs	0
Outputs	0
Dependencias	Router, HeaderComponent, FooterComponent, FloatingWhatsappComponent
Reutilización	1/10 — instancia única
Complejidad	3/10 — escucha eventos de router, setTimeout para scroll a fragmentos
Acoplamiento	7/10 — importa Header, Footer, FloatingWhatsapp
Layout (3)
Propiedad	HeaderComponent	NavComponent	FooterComponent
Responsabilidad	Header sticky con logo, hamburger, scroll detection	Menú desktop/mobile con focus trapping	Footer con datos, horarios, links, redes
Inputs	0 (HostBinding class)	isOpen, isScrolled	0
Outputs	0	navigated	0
Dependencias	RouterLink, NavComponent, content.ts	Router, content.ts (CTA label)	RouterLink, WhatsappButtonComponent, content.ts
Reutilización	1/10	1/10	1/10
Complejidad	4/10 — signals, scroll listener, HostBinding	6/10 — focus trapping, keyboard nav, router fallback	3/10 — datos estáticos, scrollTo helper
Acoplamiento	6/10	4/10	6/10
Pages (2)
Propiedad	HomePage	NotFoundPage
Responsabilidad	Orquestar 11 secciones del landing en orden	Página 404 con link al home
Inputs	0	0
Outputs	0	0
Dependencias	11 feature components	RouterLink
Reutilización	1/10	1/10
Complejidad	1/10 — passthrough, sin lógica	1/10 — sin lógica
Acoplamiento	8/10 — importa TODOS los features	1/10
Features (11)
Componente	Responsabilidad	Inputs	Outputs	Dependencias
HeroComponent	Presentación principal, CTA hero, scroll indicator	content (con defaults)	0	NgOptimizedImage, RevealDirective, WhatsappButtonComponent
AboutComponent	Historia del salón con stats decorativos	0	0	CtaButton, content.ts (SITE_NAME, CTA)
ServicesComponent	Grid de servicios con CTA WhatsApp	0	0	SectionHeader, ServiceCard, WhatsappButton, ServiceService
PricingComponent	Tabla de precios	0	0	SectionHeader, ServiceService
GalleryComponent	Grid masonry de imágenes	0	0	SectionHeader, GalleryGrid, GalleryService
TeamComponent	Perfiles del equipo con tilt 3D	0	0	SectionHeader, SvgIcon, CardTiltDirective, TeamService
TestimonialsComponent	Reseñas de clientes	0	0	SectionHeader, TestimonialCard, TestimonialService
ProcessComponent	Timeline paso a paso del proceso	0	0	SectionHeader, SvgIcon, ProcessService
PromoComponent	Banner promocional con CTA WhatsApp	0	0	CtaButton, PromoService, content.ts (WHATSAPP_NUMBER)
BookingCtaComponent	CTA grande con imagen de fondo	0	0	CtaButton
ContactComponent	Wizard de reserva de 4 pasos + sidebar contacto	0	0	SectionHeader, FormsModule, SvgIcon, ServiceService, WhatsappMessageService, content.ts
Shared Components (10)
Componente	Responsabilidad	Inputs	Outputs	Dependencias
Card	Card wrapper con slots (media/body/actions)	variant, entranceDelay, tiltEnabled	0	CardTiltDirective
Container	Wrapper de ancho max + padding responsive	narrow	0	(ninguna)
CtaButton	Botón CTA tipo primary/secondary	label (req), variant, href, external, iconAfter	clicked	SvgIcon
FloatingWhatsapp	Botón flotante WhatsApp (wrapper)	0	0	WhatsappButtonComponent
GalleryGrid	Grid masonry de imágenes	images (req)	0	(ninguna)
SectionHeader	Título + subtítulo + decorador	title (req), subtitle	0	(ninguna)
ServiceCard	Card de servicio con overlay	service (req)	book	SvgIcon, Card, Service model
SvgIcon	Icono SVG inline (10 iconos)	name (req), size, strokeWidth, ariaLabel	0	(ninguna)
TestimonialCard	Card de testimonio con stars	testimonial (req)	0	SvgIcon, Testimonial model
WhatsappButton	Botón WhatsApp con 4 variantes	variant, showLabel, label, ariaLabel	0	content.ts (WHATSAPP_NUMBER)
Directives (2)
Propiedad	RevealDirective	CardTiltDirective
Responsabilidad	IntersectionObserver que agrega clase de animación al entrar en viewport	Efecto 3D tilt que sigue el mouse
Inputs	animationClass, rootMargin, once	appCardTilt (boolean transform)
Outputs	revealed	0
Dependencias	ElementRef, NgZone	(ninguna)
Reutilización	10/10 — completamente genérico	8/10
Complejidad	5/10 — IntersectionObserver, NgZone, cleanup, state	4/10 — mouse tracking, math, HostBinding
Acoplamiento	2/10	1/10
Componentes que deberían dividirse
🔴 1. ContactComponent (207 líneas) — Debe dividirse YA
Es el outlier más grande del proyecto. El promedio de los otros 10 features es ~18 líneas. ContactComponent tiene 207 líneas, 8 métodos, 10 variables de estado, 4 pasos de wizard, validación, focus management, detección de popup bloqueado, cálculo de fechas, construcción de URLs.
Responsabilidades mezcladas en un solo componente:
Responsabilidad	Líneas estimadas
Estado del wizard (step, submitted, etc.)	~20
Step 1: Selección de servicio	~25
Step 2: Fecha y horario	~30
Step 3: Datos personales	~20
Step 4: Confirmación	~25
Navegación entre pasos (prev/next/submit)	~30
Validación	~15
Focus management	~15
Reset y side effects	~10
Sidebar con datos de contacto	~10
HTML template	~450 (inline en contact.html)
División recomendada:
contact/
├── contact.ts                  ← Container del wizard (coordina pasos)
├── contact.html                ← Layout wizard + sidebar
├── contact.css                 ← (queda, ~100 líneas)
├── wizard/
│   ├── wizard-state.service.ts ← Estado compartido del wizard
│   ├── step-service.component  ← Paso 1: elegir servicio
│   ├── step-date.component     ← Paso 2: fecha y horario
│   ├── step-data.component     ← Paso 3: nombre, teléfono, notas
│   ├── step-confirm.component  ← Paso 4: resumen y confirmar
│   └── booking-success.component ← Estado post-submit
└── sidebar/
    └── contact-sidebar.component ← Datos de contacto, horarios, redes
🟡 2. WhatsappButtonComponent (208 líneas CSS inline)
No es un problema de lógica (el TS es simple), sino de CSS inline. Tiene 4 variantes visuales con ~165 líneas de CSS inline en el decorador styles: []. Esto hace que:
- No se pueda tree-shake (siempre carga las 4 variantes)
- Sea difícil de mantener (CSS mezclado con template)
- No siga el patrón del resto del proyecto (que usa archivos .css separados)
División recomendada: Mover las 208 líneas a whatsapp-btn.css. Opcionalmente, separar cada variante en su propio selector CSS en vez de condicionales inline.
🟢 3. App (app.ts) — menor
El setTimeout(50ms) para scroll a fragmentos es frágil. Podría delegarse a un ScrollService inyectable, pero es una mejora de calidad, no una división necesaria.
Resumen
Métrica	Valor
Componentes totales	27 (1 root + 3 layout + 2 pages + 11 features + 10 shared)
Directivas	2
Componentes sin inputs	14 (52%) — la mayoría features que toman datos de servicios
Componentes con outputs	4 (App, Nav, CtaButton, ServiceCard, RevealDirective)
Componente más grande	ContactComponent — 207 líneas TS (10x el promedio)
Componente más pequeño	GalleryComponent — 3 líneas CSS + 18 TS
Componente más reutilizable	RevealDirective (10/10), CtaButton (9/10), SvgIcon (9/10), Card (9/10)
Componente más acoplado	HomePage (8/10 — importa 11 features)
Componentes a dividir	1 urgente (ContactComponent) + 1 recomendado (WhatsappButton CSS)
▣  Compaction · DeepSeek V4 Flash Free · 36.3s
+ Thought: 5.3s
⚙engram_mem_session_summary [content=## Goal
Analizar exhaustivamente el proyecto beauty-salon frontend: estructura, arquitectura Angular, design system, CSS, y componentes.

## Instructions
- Español rioplatense (voseo) para conversación, inglés para artefactos técnicos
- Modelo: deepseek-v4-flash-free (migrado desde GLM)
- Sin backend — datos mockeados en JSON, servicios con stub

## Discoveries
- ContactComponent (207 líneas TS) es 10x el promedio de los otros features — debe dividirse en wizard container + 4 step components + sidebar
- WhatsAppButtonComponent tiene 208 líneas CSS inline en el decorador — debería moverse a archivo .css separado
- Hay 10+ variantes de botón sin compartir estilos → 480 líneas duplicadas
- No hay NgModules — 100% standalone components con signals
- Sistema de animación completo con prefers-reduced-motion
- WhatsApp usa prefijo 521 + 10 dígitos
- Self-hosted fonts (Inter + Playfair Display)

## Accomplished
- ✅ Análisis completo de arquitectura Angular: 11 aspectos calificados, promedio 8.2/10
- ✅ Evaluación de Design System: 13 evaluaciones, tokens y tipografía destacan (10/10), inputs y botones criticados (4/10 y 7/10)
- ✅ Análisis de CSS: 4,162 líneas, 25 archivos, 25 keyframes, 67 media queries, 92 variables, 10 prioridades de refactor
- ✅ Componentes: 27 componentes + 2 directivas analizados con tabla de inputs/outputs/deps/reuso/complejidad/acoplamiento
- ✅ Identificados componentes críticos: ContactComponent (urgente dividir), WhatsappButton (mover CSS), App (scroll frágil)
- ✅ Config de agentes migrada en opencode.json

## Next Steps
- El usuario debe decidir qué hacer con las recomendaciones de refactor (ContactComponent, botones, inputs)
- O iniciar un cambio SDD para abordar alguna de las deudas técnicas identificadas

## Relevant Files
- beauty-salon/frontend/src/app/features/contact/contact.ts — 207 líneas, requiere división en wizard+steps+sidebar
- beauty-salon/frontend/src/app/shared/components/whatsapp-btn/whatsapp-btn.ts — 208 líneas CSS inline
- beauty-salon/frontend/src/app/shared/components/cta-button/cta-button.ts — botón CTA principal
- beauty-salon/frontend/src/app/shared/directives/reveal.directive.ts — mejor directiva (10/10 reuso)
- beauty-salon/frontend/src/app/shared/components/svg-icon/svg-icon.ts — 9/10 reuso, 10 iconos inline
- beauty-salon/frontend/src/styles/tokens.css — design tokens (162 líneas)
- beauty-salon/frontend/src/styles/animation.css — animaciones (285 líneas)]
+ Thought: 2.4s
Bueno, el análisis está completo — tenemos un mapa bastante detallado del proyecto.
Lo que hicimos:
1. ✅ Estructura, arquitectura Angular (8.2/10), design system, CSS — todo evaluado
2. ✅ 27 componentes + 2 directivas analizados con métricas
3. ✅ Detecté los puntos críticos
Lo que salta a la vista como siguientes pasos concretos:
Prioridad	Qué	Por qué
🔴 Crítico	Dividir ContactComponent (207 líneas TS)	10x el promedio del proyecto — wizard de 4 pasos + sidebar, todo en un mismo archivo
🟡 Recomendado	Mover CSS inline de WhatsappButtonComponent (208 líneas)	Rompe el patrón del proyecto, no se puede tree-shake
🟢 Refactor medio	Unificar las 10+ variantes de botón que comparten ~480 líneas duplicadas	Ya tenés design tokens, pero los botones no los aprovechan
🟢 Mejora	Compartir estilos de inputs (calificación 4/10 en design system)	El formulario del wizard los necesita y hoy no existen
