Roadmap: Beauty Salon Frontend
Proyecto: Landing page SPA — Angular 22, Tailwind v4, TypeScript 6, Signals
Período: ~6 sprints (6 semanas)
Equipo sugerido: 1 FE senior + 1 FE semi-senior (o 1 senior full-time)
Total deuda estimada: ~7-10 días hábiles netos
Mapa de Dependencias
Epic 1: Quick Wins ───────────────────────────────────────────
  (sin dependencias, arranca día 1)

Epic 2: Architecture
  └── Depende de: Epic 1 (tener el código estable)
  ├── C2 (JsonService) ─── independiente
  ├── C4 (Button system) ── independiente
  └── M1 (Hardcoded data) ── independiente

Epic 3: Quality Infrastructure
  ├── C5.1 (Tests: services) ─── independiente
  ├── C5.2 (Tests: wizard) ───── depende de C1 (Epic 4)
  ├── B3 (ESLint) ────────────── independiente
  └── M5 (Booking cleanup) ───── depende de C1

Epic 4: Big Refactor
  └── C1 (ContactComponent) ──── depende de C2 (para servicios) + C4 (para botones compartidos)

Epic 5: Performance
  ├── A1 (Images) ──────── depende de estructura estable (Epic 4)
  ├── A5 (Service Worker) ─── depende de Epic 1-2
  └── C3 (SSR eval) ────── depende de decisión de negocio
Épica 1 — Quick Wins & Accesibilidad Inmediata
Objetivo: Eliminar deuda de baja complejidad y alto impacto en accesibilidad/UX en la primera semana. Generar momentum en el equipo.
Duración: Sprint 1 (semana 1)
Dependencias: Ninguna. Todo es código existente sin riesgo de regresión.
Sprint 1 — "Low Hanging Fruit"
Día	ID	Historia Técnica	Tareas
1	A2	Como usuario de lector de pantalla, quiero que los links sociales no sean href="#" rotos	• Relevar redes reales del salón con el cliente<br>• Reemplazar href="#" por URLs reales en FooterComponent, ContactComponent sidebar<br>• Si no existen, remover los elementos del DOM
1	A4	Como usuaria del wizard, quiero que no me deje avanzar sin elegir horario	• Modificar canGoNext case 2: agregar && this.selectedTime !== ''<br>• Verificar que la UI muestre error si se intenta avanzar sin horario
1	M2	Como usuario de screen reader, quiero que la navegación principal esté bien identificada	• Agregar role="navigation" y aria-label="Navegación principal" al template de NavComponent
2	M3	Como usuario de screen reader, quiero que los cambios de paso en el wizard se anuncien automáticamente	• Agregar aria-live="polite" container en wizard<br>• Crear señal wizardStatusMessage que se actualice en cada transición de paso y en submit<br>• Probar con VoiceOver/NVDA
2	A3	Como navegador, quiero descargar las fuentes críticas lo antes posible	• Agregar <link rel="preload" as="font"> para Inter y Playfair en index.html<br>• Poner antes de styles.css<br>• Verificar en DevTools Network timeline que las fuentes arranquen ASAP
2	A6	Como usuaria, quiero que la navegación a páginas lazy sea instantánea	• Agregar withPreloading(PreloadAllModules) en provideRouter en app.config.ts
3	A7	Como developer, quiero que el CSS de WhatsAppButton sea mantenible y tree-shakeable	• Mover 165 líneas de CSS inline a whatsapp-btn.css<br>• Cambiar styles: [...] por styleUrl<br>• Verificar que las 4 variantes se vean igual
3	B1	Como usuaria, quiero que el scroll a fragmentos funcione siempre, incluso en dispositivos lentos	• Extraer lógica de scroll a ScrollService inyectable<br>• Usar afterNextRender en vez de setTimeout(50)<br>• Inyectar en AppComponent y FooterComponent
3	B2	Como dev, quiero que los textos del Hero no estén duplicados respecto a content.ts	• Reemplazar defaults inline de HeroComponent.content.input por valores de content.ts<br>• Mantener el input como overrideable
Definition of Done: Cada item tiene PR con screenshot antes/después o verification en DevTools. Las historias de accesibilidad se verifican con al menos un lector de pantalla.
Riesgos: Ninguno significativo. Todo es código existente, cambios delimitados.
Épica 2 — Arquitectura & DRY
Objetivo: Eliminar la duplicación estructural que hace costoso mantener el código. Sentar base para los refactors grandes.
Duración: Sprint 2 (semana 2)
Dependencias: Epic 1 completa (para evitar tocar el mismo código dos veces).
Sprint 2 — "Pagar la deuda estructural"
ID	Prioridad	Historia Técnica	Tareas
C2	🔴	Como dev, quiero que los 6 servicios JSON compartan el mismo pipeline HTTP para no repetir lógica	• Crear core/services/json-service.ts con función genérica createJsonService<T>(url) que retorna Observable con shareReplay + catchError<br>• Refactorizar ServiceService, TeamService, TestimonialService, GalleryService, ProcessService, PromoService para usarla<br>• Verificar que cada servicio expone exactamente los mismos métodos públicos que antes<br>• Actualizar tests si existen
C4	🔴	Como dev, quiero que todos los botones del sistema compartan las mismas clases CSS y tokens	• 1. Inventariar: .btn, .btn-primary, .btn-secondary (styles.css), CtaButton.variant ('primary'|'secondary'), WhatsappButtonComponent.variant ('hero'|'footer'|'services'|'floating')<br>• 2. Definir sistema de variantes unificado en design tokens (ya existe --btn-transition, --btn-scale-hover en animation.css)<br>• 3. Refactorizar .btn-primary/.btn-secondary para usar @apply con los tokens<br>• 4. Hacer que WhatsappButtonComponent herede .btn y solo defina color/radius específico<br>• 5. Eliminar CSS duplicado de botones en WhatsAppButton
M1	🟢	Como dev, quiero que los datos del negocio no estén hardcodeados en componentes	• Mover schedule, morningSlots, afternoonSlots, pasoLabels a content.ts<br>• Mover AboutComponent.stats ([{value:'10+',...}]) a un JSON stats.json o a content.ts<br>• Actualizar imports en ContactComponent y AboutComponent
B5	🔵	Como dev, quiero separar datos de negocio de textos de UI	• Dividir content.ts en content/business.ts (teléfono, dirección, email, horarios) y content/ui.ts (CTA labels, defaults)<br>• Actualizar imports en todos los componentes
Definition of Done: Los 6 servicios JSON no contienen http.get().pipe(shareReplay(1)) repetido. WhatsappButtonComponent no tiene CSS inline ni define estilos de botón propios. Los datos de negocio se pueden modificar sin tocar TypeScript.
Riesgo potencial: C4 puede tener efecto visual si los estilos no se mapean exactamente. Incluir verification visual con las 4 variantes de WhatsAppButton + CtaButton primary/secondary.
Épica 3 — Infraestructura de Calidad
Objetivo: Poner la red de seguridad antes de los refactors grandes. Sin tests, tocar ContactComponent es apostar.
Duración: Sprint 3 (semana 3)
Dependencias: Epic 2 (para tener los servicios ya refactorizados antes de testearlos).
Sprint 3 — "Red de seguridad"
ID	Prioridad	Historia Técnica	Tareas
C5.1	🔴	Como dev, quiero tests unitarios para la lógica pura del proyecto	• Test: WhatsappMessageService.buildText() con diferentes combinaciones de parámetros<br>• Test: WhatsappMessageService.buildUrl() verifica encoding y número correcto<br>• Configurar Vitest con @angular/build:unit-test (ya existe en angular.json)<br>• Verificar cobertura de los servicios JSON usando HttpClientTestingController
B3	🔵	Como dev, quiero que el código sea consistente y los errores comunes se atrapen en CI	• ng add @angular-eslint/schematics<br>• Configurar reglas recomendadas (TypeScript + Angular + Template)<br>• Agregar script lint en package.json<br>• Configurar fix-on-save en .vscode/settings.json
M5	🟢	Como dev, quiero que el proyecto no tenga 118 líneas de código muerto de booking stub	• Decisión: ¿El booking será siempre WhatsApp-only o planean backend?<br>• Si WhatsApp-only: eliminar BookingService y BookingApiService, dejar solo WhatsappMessageService<br>• Si planean backend: agregar comentario claro y simplificar el stub (no necesita 3 métodos con console.warn)<br>• Actualizar imports si es necesario
M4	🟢	Como Google, quiero encontrar todas las páginas del sitio fácilmente	• Crear public/sitemap.xml con home + not-found<br>• Crear public/robots.txt que referencie el sitemap<br>• Verificar en Google Search Console después del deploy
Definition of Done: WhatsappMessageService tiene cobertura de tests >90%. ESLint pasa sin errores. No hay código muerto de booking. sitemap.xml desplegado.
Épica 4 — El Refactor Grande
Objetivo: Dividir el monolito que es ContactComponent en una arquitectura de wizard mantenible, testeable y extendible.
Duración: Sprint 4-5 (semanas 4-5)
Dependencias:
- C2 (Epic 2) — el wizard va a usar ServiceService, que debe estar refactorizado
- C4 (Epic 2) — los botones del wizard deben usar el sistema unificado
- M3 (Epic 1) — el aria-live debe estar en su lugar para refactorizar con accesibilidad
Sprint 4 — "Wizard: Estado y Pasos"
ID	Prioridad	Historia Técnica	Tareas
C1.1	🔴	Como dev, quiero que el estado del wizard esté desacoplado del componente de UI	• Crear WizardStateService con signals: step, submitted, selectedServiceId, selectedDate, selectedTime, name, clientPhone, notes, popupBlocked<br>• Mover validación canGoNext al servicio como método<br>• Mover isClosedDay, minDate, selectedService como computed signals<br>• Mover onSubmit, resetForm, openWhatsApp al servicio<br>• Testear WizardStateService en aislamiento
C1.2	🔴	Como dev, quiero que cada paso del wizard sea un componente independiente	• Crear estructura contact/wizard/:<br>  • step-service.component.ts — selección de servicio<br>  • step-date.component.ts — fecha y horario<br>  • step-data.component.ts — nombre, teléfono, notas<br>  • step-confirm.component.ts — resumen y confirmar<br>• Cada paso recibe estado via WizardStateService, emite eventos de navegación<br>• Mover templates de cada paso a su propio archivo HTML
Sprint 5 — "Wizard: Container y Sidebar"
ID	Prioridad	Historia Técnica	Tareas
C1.3	🔴	Como dev, quiero que ContactComponent sea un container que orquesta pasos y sidebar	• Refactorizar ContactComponent como container:<br>  • Inyecta WizardStateService<br>  • Renderiza step activo con @switch<br>  • Renderiza progreso, navegación, y sidebar como slots<br>• El template HTML pasa de ~450 líneas a ~60<br>• El TS pasa de 207 líneas a ~40
C1.4	🟢	Como dev, quiero que la sidebar de contacto sea un componente independiente	• Crear contact/sidebar/contact-sidebar.component.ts<br>• Mover datos de contacto, horarios, iconos sociales<br>• Recibe datos via input (business info)
C5.2	🔴	Como dev, quiero tests para el flujo completo del wizard	• Test: flujo feliz (step1→step2→step3→step4→confirm)<br>• Test: validaciones en cada paso<br>• Test: reset del wizard<br>• Test: detección de popup bloqueado
Definition of Done: ContactComponent pasa de 207 líneas TS + 450 HTML a ~40 TS + ~60 HTML. WizardStateService tiene tests. Los 4 step components se pueden renderizar individualmente en historias de Storybook (o aislamiento). Sidebar es un componente independiente.
Épica 5 — Performance & Delivery
Objetivo: Optimizar tiempos de carga, imágenes, y preparar el proyecto para producción real.
Duración: Sprint 6 (semana 6)
Dependencias: Epic 4 (para que la base de código esté estable antes de optimizar). La decisión sobre SSR depende del negocio y puede abortar esta épica si se decide migrar a Analog/SSR.
Sprint 6 — "Ponerlo rápido"
ID	Prioridad	Historia Técnica	Tareas
A1	🟡	Como usuaria en mobile, quiero no descargar imágenes de 136KB cuando mi pantalla es de 375px	• Configurar IMAGE_CONFIG con breakpoints del proyecto (375, 640, 768, 1024, 1280)<br>• Reemplazar <img> por ngSrc con NgOptimizedImage en todos los componentes:<br>  • gallery-grid.ts (hoy usa img[src] directo)<br>  • service-card.html (si usa img)<br>  • team.html (si usa img)<br>  • process.html (si usa img)<br>  • promo.html<br>  • booking-cta.html<br>  • about.html<br>• Agregar pipeline de build: sharp o squoosh para re-comprimir WebP automáticamente (postinstall script o plugin de build)<br>• Evaluar AVIF como formato primario con fallback WebP usando <picture>
A5	🟡	Como usuaria recurrente, quiero que la segunda carga del sitio sea instantánea	• ng add @angular/pwa o configurar Workbox manualmente<br>• Configurar ngsw-config.json con estrategia performanceMode<br>• Precachear: JS, CSS, fuentes, JSON de datos<br>• Cachear imágenes con estrategia lazy (cache-first después de primera carga)<br>• Testear offline mode en DevTools
C3	🔴	Como dueño del negocio, quiero que mi sitio aparezca en Google cuando alguien busca "salón de belleza Córdoba"	• Decisión de negocio primero: ¿El SEO orgánico justifica la inversión de SSR?<br>• Opción A (mantener CSR): mitigar con:<br>  • Splash screen estático en index.html (pinta hero sin JS)<br>  • Prerender de rutas críticas con ng extract-i18n o manual<br>• Opción B (SSR completo): implementar provideServerRouting de Angular 22 y configurar Node.js server o Firebase Functions<br>• Opción C (SSG híbrido): migrar a Analog para pre-renderizado estático con Angular
Definition of Done: Las imágenes en mobile pesan 60% menos. El sitio funciona offline (Service Worker). La decisión de SSR está documentada y ejecutada o diferida explícitamente con un plan alternativo.
Riesgo: C3 puede ser un proyecto en sí mismo si se elige SSR. Depende completamente de presupuesto y prioridades del negocio.
Timeline Consolidado
Semana 1    │ Epic 1: Quick Wins ─────────────────────── 9 items (2h)
Semana 2    │ Epic 2: Architecture ───────────────────── 4 items (1d)
Semana 3    │ Epic 3: Quality Infrastructure ─────────── 4 items (1.5d)
Semana 4-5  │ Epic 4: Big Refactor ───────────────────── 4 items (2-3d)
Semana 6    │ Epic 5: Performance ────────────────────── 3 items (2-4d)*
            │
            │ *C3 (SSR) puede extender a 1-2 sprints adicionales
Resumen de Entregables por Sprint
Sprint	Entregables clave
S1	Links sociales funcionales, wizard validado, nav accesible, aria-live en wizard, font preload, preloading routes, WhatsAppBtn sin CSS inline, ScrollService, Hero sin duplicación
S2	JsonService base (6 servicios refactorizados), sistema de botones unificado, datos extraídos a content.ts/JSON, content.ts separado por dominio
S3	Tests de WhatsappMessageService + JSON services, ESLint configurado, BookingApiService limpiado (o eliminado), sitemap.xml + robots.txt
S4	WizardStateService testeable, 4 step components (service, date, data, confirm), estructura contact/wizard/
S5	ContactComponent como container (~40 líneas TS), ContactSidebarComponent, tests de flujo completo del wizard
S6	Responsive images con NgOptimizedImage + pipeline compresión, Service Worker con precache, decisión de SSR documentada y ejecutada
Lo que NO está en este roadmap (y está bien)
Item	Motivo
Stories/Storybook	No hay dependencia de UI components externa que lo justifique hoy
E2E con Playwright	Postergado hasta que el wizard esté refactorizado (Sprint 5). Agregar en Sprint 6
i18n	El sitio es es-AR only. Si expanden, i18n requiere arquitectura diferente
Backend real para booking	No. El modelo de negocio es WhatsApp-first. Si agregan backend, es otro proyecto
Tailwind v4 purge	No necesario — Tailwind v4 JIT ya tree-shakea en build