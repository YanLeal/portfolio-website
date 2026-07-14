Deuda Técnica — Beauty Salon Frontend
Resumen Ejecutivo
Prioridad	Cantidad
🔴 Crítica	5 items
🟡 Alta	7 items
🟢 Media	5 items
🔵 Baja	5 items
Total	22 items
🔴 Crítica
C1. ContactComponent — monolito de 207 líneas
 	 
Qué	ContactComponent tiene 207 líneas TS + 450 líneas HTML. Mezcla container, wizard de 4 pasos, validación, focus management, detección de popup, sidebar de contacto. Es 10× el promedio del proyecto (18 líneas los otros features).
Riesgo	Alto. Cualquier cambio en un paso del wizard puede romper otro. No se puede testear de forma aislada. El HTML es casi imposible de leer/refactorizar.
Esfuerzo	Alto (~1-2 días). Crear WizardStateService, 4 step componentes, sidebar componente, refactor ContactComponent a container.
Beneficio	Testeabilidad, mantenibilidad, posibilidad de lazy-load de pasos. Reduce el riesgo de regresiones.
Recomendación	Extraer a: contact/ → wizard/ (state service + 4 step components) + sidebar/ + contact.ts como container. Hacerlo antes de tocar cualquier lógica de booking.
C2. Servicios JSON duplicados — 6 copias del mismo patrón
 	 
Qué	ServiceService, TeamService, TestimonialService, GalleryService, ProcessService, PromoService son 6 implementaciones del mismo patrón: http.get().pipe(shareReplay(1), catchError(...)) con diferente URL y tipo.
Riesgo	Medio-Alto. Cambiar el pipeline HTTP (ej: agregar headers de cache, error handling global) requiere tocar 6 archivos. La tentación de copiar-pegar errores es alta.
Esfuerzo	Bajo (~2-3 horas). Crear un JsonService base o una función factory.
Beneficio	DRY real. Un solo lugar para modificar caching, errores, transformaciones. Los servicios nuevos se crean en 1 línea.
Recomendación	Crear core/services/json-service.ts con un método estático o función createJsonService<T>(url) que devuelva el Observable cacheado. Inyectar HttpClient con inject() dentro de la función o usar una base class.
C3. Sin SSR — CSR puro con 432KB de JS inicial
 	 
Qué	El sitio es CSR 100%. Angular 22 bootstrap en el cliente. El hero (LCP) no se pinta hasta que se descargan, parsean y ejecutan ~432KB de JS (291KB non-lazy).
Riesgo	Alto para SEO y Core Web Vitals. Google indexa JS pero con penalización. LCP en conexiones lentas puede ser >5s. La página no muestra NADA hasta que Angular termina bootstrap.
Esfuerzo	Alto (~3-5 días). Evaluar Angular SSR (provideServerRouting), o migrar a Analog (SSG con Angular), o aceptar CSR y mitigar con precarga agresiva.
Beneficio	LCP baja de ~5s a ~1s. SEO mejora significativamente. Indexación inmediata.
Recomendación	Evaluar si este proyecto necesita SSR. Para un salón de belleza local con poco tráfico orgánico, quizá CSR es aceptable. Si SEO es prioridad, implementar Angular SSR. Mínimo: agregar un splash screen estático mientras carga Angular.
C4. Sistema de botones duplicado — 480+ líneas CSS sin compartir
 	 
Qué	WhatsappButtonComponent tiene 4 variantes con CSS inline (165 líneas de estilos específicos por variante). CtaButton tiene su propio CSS. Los .btn, .btn-primary, .btn-secondary están en styles.css. Hay ~480 líneas de CSS de botones sin compartir entre componentes.
Riesgo	Alto. Cambiar el diseño de un botón implica tocar 3+ lugares. Las variantes de WhatsApp Button no se pueden tree-shake (CSS inline en el decorador). Inconsistencias visuales garantizadas.
Esfuerzo	Medio (~4-6 horas). Unificar todos los botones bajo un mismo sistema de variantes con design tokens.
Beneficio	Un solo lugar para estilos de botones. Tree-shaking. Consistencia visual garantizada. El CSS inline de WhatsAppBtn se reduce a 0.
Recomendación	1) Mover CSS de WhatsappButtonComponent a archivo separado. 2) Unificar .btn, .btn-primary, .btn-secondary con CtaButton.variant. 3) Que WhatsappButtonComponent use las clases .btn compartidas y solo defina variante de color (hero/footer/services/floating) como modificador. Ver la @theme de tokens para colores.
C5. Sin tests automatizados
 	 
Qué	El proyecto tiene Vitest configurado (package.json tiene "vitest": "^4.0.8" y "@angular/build":unit-test" en angular.json), pero no hay UN solo archivo .spec.ts. Ni unit tests, ni integration tests, ni component tests.
Riesgo	Alto. Cualquier refactor (C1, C2, C4) se hace a ciegas. No hay red de seguridad. El wizard de contacto (C1) es particularmente riesgoso sin tests.
Esfuerzo	Medio-Alto (~1-2 días para cobertura crítica). Empezar por: servicios JSON (fáciles de testear), WhatsappMessageService (pura lógica), RevealDirective, y el wizard state.
Beneficio	Los refactors dejan de ser aterradores. Pipeline de CI/CD viable. Calidad de código sostenible.
Recomendación	Prioridad: 1) WhatsappMessageService (sin dependencias, pura lógica). 2) Servicios JSON (mockear HttpClient). 3) Wizard state service (después de extraerlo en C1). 4) E2E con Playwright para el flujo crítico de reserva. Usar el Vitest ya configurado.
🟡 Alta
A1. Sin responsive images / srcset
 	 
Riesgo	Medio. En mobile (375px), la hero de 78KB (1920×1080) se descarga COMPLETA. Lo mismo para about-1200x1350.webp (136KB). Galería, services, team — todos sin srcset.
Esfuerzo	Medio (~3-4 horas). Agregar NgOptimizedImage con srcset y sizes en las imágenes clave, o usar <picture> con AVIF + WebP.
Beneficio	Ahorro estimado de ~40-60% de peso de imágenes en mobile. Hero pasaría de 78KB a ~25KB en mobile. Mejora LCP y data usage.
Recomendación	Usar NgOptimizedImage de Angular que ya genera srcset automático con el loader. Definir IMAGE_CONFIG con breakpoints del proyecto (375, 640, 768, 1024, 1280px).
A2. Links sociales con href="#"
 	 
Riesgo	Medio-Alto. FooterComponent: Instagram, Facebook, TikTok → href="#" con TODO: add real link. ContactComponent sidebar: Instagram, Facebook → href="#". team.json: todas las redes sociales son "#".
Esfuerzo	Bajo (~15 min). Poner URLs reales o borrar los elementos.
Beneficio	Los usuarios de lector de pantalla no llegan a links rotos. Los usuarios de teclado no se pierden en un # que no hace nada. Credibilidad de marca.
Recomendación	Si el salón tiene redes reales, ponerlas. Si no, sacar los iconos del DOM (no ocultarlos con CSS — removerlos). Para team.json, si las redes son placeholder, sacar el campo social del JSON o documentar que es mock.
A3. Sin preload de fuentes críticas
 	 
Riesgo	Medio. Las fuentes se descubren cuando fonts.css termina de parsear. El navegador las ve tarde en el waterfall. Con font-display: swap, hay un FOIT invisible seguido de swap (parpadeo).
Esfuerzo	Bajo (~5 min). Agregar <link rel="preload" as="font" href="/fonts/inter-latin.woff2" crossorigin> y lo mismo para Playfair Display en index.html.
Beneficio	Las fuentes empiezan a descargar inmediatamente, en paralelo con styles.css. Reduce FOIT/FOUT. Mejora FCP.
Recomendación	Preload Inter (se usa en body, es la fuente crítica) y Playfair (headings). Ponerlos antes de styles.css en el <head>.
A4. ContactComponent sin validación de horario en step 2
 	 
Riesgo	Medio. canGoNext en step 2 solo valida !isClosedDay (que no sea domingo). No verifica que el usuario seleccionó un horario. Se puede llegar a step 3 sin elegir horario.
Esfuerzo	Bajo (~15 min). Agregar selectedTime !== '' a la condición de canGoNext para step 2.
Beneficio	UX correcta. No se puede avanzar sin datos esenciales.
Recomendación	Cambiar case 2: return !this.isClosedDay; → case 2: return !this.isClosedDay && this.selectedTime !== '';.
A5. Sin Service Worker / PWA
 	 
Riesgo	Medio. Todos los assets (JS, CSS, imágenes, JSON) se descargan del servidor cada vez. No hay offline, no hay cacheo inteligente. Segunda visita carga igual que la primera.
Esfuerzo	Medio (~½-1 día). Agregar @angular/service-worker, configurar ngsw-config.json, precachear assets estáticos y JSON.
Beneficio	Segunda carga inmediata (desde cache). Las 6 peticiones a JSON no se repiten. Experiencia offline parcial. Mejora Lighthouse.
Recomendación	Implementar Angular Service Worker con estrategia PerformanceMode (cache primero). Los datos JSON de catálogo cambian poco, son ideales para cache.
A6. Rutas lazy sin preloading
 	 
Riesgo	Bajo-Medio. Las rutas HomePage y NotFoundPage se cargan con loadComponent pero sin withPreloading. El navegador las descarga bajo demanda, no en idle.
Esfuerzo	Bajo (~5 min). Agregar withPreloading(PreloadAllModules) en provideRouter.
Beneficio	Las rutas lazy se descargan en segundo plano después del bootstrap. La navegación a NotFound (si ocurre) es instantánea.
Recomendación	provideRouter(routes, withInMemoryScrolling(...), withPreloading(PreloadAllModules))
A7. WhatsAppButtonComponent — 208 líneas de CSS inline en el decorador
 	 
Riesgo	Medio. 165 líneas de CSS de 4 variantes inline en styles: [] del decorador @Component. No se puede tree-shake. No sigue el patrón del proyecto (archivos .css separados). Difícil de mantener.
Esfuerzo	Bajo (~30 min). Mover las 165 líneas a whatsapp-btn.css y sacarlas del decorador.
Beneficio	Tree-shaking, consistencia con el resto del proyecto, mantenibilidad.
Recomendación	Cortar todo el array styles: [...] y poner styleUrl: './whatsapp-btn.css'. Crear el archivo con el contenido.
🟢 Media
M1. Datos hardcodeados en AboutComponent y ContentComponent
 	 
Qué	AboutComponent.stats ([{value:'10+', label:'Años...'}, ...]) hardcodeado en TS. ContactComponent.schedule ('Lun a Sáb: 9:00 – 20:00'), pasoLabels, morningSlots, afternoonSlots hardcodeados.
Riesgo	Bajo-Medio. Cambiar horarios del salón requiere editar código TS. Stats de About requiere re-build.
Esfuerzo	Bajo (~1 hora). Mover a content.ts o a un JSON (schedule.json).
Beneficio	Datos editables sin tocar código. Preparado para CMS futuro.
Recomendación	Mover schedule, morningSlots, afternoonSlots a content.ts. Mover stats de About a un JSON.
M2. Sin roles ARIA semánticos en navegación
 	 
Qué	El menú nav no tiene role="navigation". No hay aria-label en la nav para distinguirla de otras navs (si hubiera).
Riesgo	Bajo. Los screen readers detectan <nav> por tag name, pero sin aria-label no se distingue de otras navs.
Esfuerzo	Bajo (~5 min). Agregar role="navigation" y aria-label="Navegación principal" al <nav>.
Beneficio	Accesibilidad correcta.
Recomendación	Agregar role="navigation" y aria-label en el template de NavComponent.
M3. Sin aria-live para cambios en el wizard
 	 
Qué	Cuando el usuario avanza de paso, o cuando se envía el formulario, los lectores de pantalla no reciben notificación. El estado submitted renderiza el success state sin anuncio.
Riesgo	Bajo-Medio. Usuarios de screen reader no saben que el wizard cambió o que el turno se envió.
Esfuerzo	Bajo (~30 min). Agregar aria-live="polite" a un contenedor alrededor del wizard body, y actualizar un texto descriptivo en cada cambio de paso.
Beneficio	Accesibilidad completa para el flujo crítico de reserva.
Recomendación	Agregar un <div aria-live="polite" aria-atomic="true"> envuelve el contenido dinámico. Actualizar un ariaStatusMessage signal en cada transición.
M4. Sin sitemap.xml
 	 
Qué	No hay sitemap.xml en public/.
Riesgo	Bajo. Google descubre URLs via crawling y el sitio tiene pocas páginas. Pero sin sitemap, páginas nuevas o actualizadas tardan más en indexarse.
Esfuerzo	Bajo (~15 min). Crear public/sitemap.xml con las URLs del sitio (home y not-found).
Beneficio	Indexación más rápida y controlada.
Recomendación	Crear public/sitemap.xml simple con la home y la 404. Agregar robots.txt que referencie el sitemap.
M5. BookingApiService es stub sin usar
 	 
Qué	BookingApiService (87 líneas) es un stub completo con of(...).pipe(delay(...)) y comentarios extensos documentando cómo reemplazar por HTTP real. Pero ContactComponent no lo usa — usa WhatsappMessageService directo para abrir WhatsApp. BookingService es fachada que llama al stub pero no se inyecta en ningún componente.
Riesgo	Bajo. No hay funcionalidad perdida (el booking funciona por WhatsApp). Pero hay 118 líneas de código muerto que confunden y dan falsa expectativa de que hay un backend.
Esfuerzo	Bajo (~15 min). Sacar BookingApiService y BookingService, o simplificarlos a una función.
Beneficio	Menos código muerto. Menos confusión cuando alguien nuevo lee el proyecto.
Recomendación	Si el booking siempre va a ser WhatsApp-only, eliminar ambos servicios y dejar solo WhatsappMessageService. Si planean backend, dejarlos pero documentar el estado con más claridad.
🔵 Baja
B1. AppComponent scroll con setTimeout(50) frágil
 	 
Qué	App.ngOnInit() escucha NavigationEnd y hace setTimeout(() => scrollIntoView(...), 50) para scroll a fragmentos. Es frágil: si el DOM tarda más de 50ms en renderizar, no scrollea.
Riesgo	Bajo. Funciona en el caso normal. Si la conexión es lenta o el dispositivo es lento, el timeout puede ser insuficiente.
Esfuerzo	Bajo (~15 min). Delegar a un ScrollService inyectable que use afterNextRender en vez de setTimeout.
Beneficio	Scroll confiable independientemente de cuándo termine el renderizado.
Recomendación	Extraer a un ScrollService con afterNextRender de Angular 18+.
B2. Hero input defaults en código
 	 
Qué	HeroComponent.content.input<HeroContent>({ businessName: 'Belleza & Estilo', ... }) tiene defaults inline en el componente. Si cambia el nombre del salón, hay que editar el componente, no content.ts.
Riesgo	Bajo. El input permite override desde el padre, los defaults son fallback. Pero content.ts tiene SITE_NAME que queda como duplicado.
Esfuerzo	Bajo (~10 min). Mover defaults a content.ts o usar inject(CONTENT_TOKEN).
Beneficio	Una sola fuente de verdad para textos del sitio.
Recomendación	Usar SITE_NAME, CTA_RESERVAR, etc. de content.ts como defaults del input.
B3. Sin Prettier / ESLint configurado para Angular
 	 
Qué	Hay .prettierrc pero no eslint.config.js. Angular 22 usa ESLint flat config por defecto, pero no está configurado. No hay reglas de estilo ni linting automático.
Riesgo	Bajo. El código es consistente por ahora (un solo dev), pero sin linting automático, la calidad depende de la disciplina.
Esfuerzo	Bajo (~15 min). ng add @angular-eslint/schematics y configurar reglas básicas.
Beneficio	Errores comunes se atrapan en CI. Código consistente.
Recomendación	Agregar ESLint con las recomendaciones de Angular + TypeScript. Configurar como fix-on-save en el workspace.
B4. social links en team.json son todos placeholder
 	 
Qué	team.json tiene 3 miembros, cada uno con social: { instagram: "#", facebook: "#" }. Son todos placeholders.
Riesgo	Bajo. Los links no se muestran en la UI (el template de TeamComponent usa SvgIcon pero no se ve que renderice los social links). Si se agregan después, usarán "#".
Esfuerzo	Bajo (~5 min). Sacar social de los miembros o cambiarlos a null si no existen.
Beneficio	Datos honestos. No hay riesgo de que alguien deploye con "#".
Recomendación	Si las redes reales de cada miembro no existen, sacar el campo social del JSON o cambiarlo a social: null.
B5. content.ts mezcla constantes de negocio con CTAs de UI
 	 
Qué	content.ts tiene tanto WHATSAPP_NUMBER (negocio) como CTA_RESERVAR (UI label). No hay separación por dominio.
Riesgo	Muy bajo. Es más de organización que de riesgo técnico.
Esfuerzo	Bajo (~15 min). Dividir content.ts en business.ts (teléfono, dirección, email, horarios) y ui.ts (CTA labels, defaults de UI).
Beneficio	Organización clara. Preparado para i18n o CMS.
Recomendación	Separar cuando se toque el archivo por otra razón. No vale la pena hacerlo ahora como tarea aislada.
Tabla consolidada
ID	Deuda	Prioridad
C1	ContactComponent monolito	🔴 Crítica
C2	Servicios JSON duplicados	🔴 Crítica
C3	Sin SSR (432KB JS inicial)	🔴 Crítica
C4	Botones duplicados (480+ líneas)	🔴 Crítica
C5	Sin tests	🔴 Crítica
A1	Sin responsive images	🟡 Alta
A2	Links sociales href="#"	🟡 Alta
A3	Sin preload de fuentes	🟡 Alta
A4	Wizard step 2 sin validación horario	🟡 Alta
A5	Sin Service Worker	🟡 Alta
A6	Sin preloading de rutas lazy	🟡 Alta
A7	WhatsAppBtn CSS inline (208 líneas)	🟡 Alta
M1	Datos hardcodeados en About/Contact	🟢 Media
M2	Sin roles ARIA en nav	🟢 Media
M3	Sin aria-live en wizard	🟢 Media
M4	Sin sitemap.xml	🟢 Media
M5	BookingApiService stub muerto (118 líneas)	🟢 Media
B1	App setTimeout(50) scroll	🔵 Baja
B2	Hero defaults duplicados	🔵 Baja
B3	Sin ESLint configurado	🔵 Baja
B4	team.json social links placeholder	🔵 Baja
B5	content.ts mezcla negocio/UI	🔵 Baja
Orden recomendado para tacklear
Semana 1 (prioridad máxima)
├── A2 — Links sociales rotos (15 min, accesibilidad)
├── A4 — Validación horario wizard (15 min)
├── M2 — Roles ARIA nav (5 min)
├── M3 — aria-live wizard (30 min)
├── B1 — App scroll service (15 min)
├── A3 — Preload de fuentes (5 min)
├── A6 — Preloading rutas (5 min)
├── A7 — WhatsAppBtn CSS a archivo (30 min)
└── B2 — Hero defaults a content.ts (10 min)
  ─────────────────  ~2 horas

Semana 2 (alta deuda)
├── C2 — Base JsonService (2-3 horas)
├── C4 — Unificar botones (4-6 horas)
├── M1 — Mover datos hardcodeados (1 hora)
├── M4 — sitemap.xml (15 min)
└── M5 — Simplificar BookingApiService (15 min)
  ─────────────────  ~1 día

Semana 3 (refactor grande)
├── C1 — Dividir ContactComponent (1-2 días)
└── C5 — Tests: WhatsappMessageService + servicios (1 día)
  ─────────────────  ~2-3 días

Semana 4 (optimización)
├── A1 — Responsive images + pipeline compresión (3-4 horas)
├── A5 — Service Worker (½-1 día)
└── C3 — Evaluar SSR (depende de decisión de negocio)
  ─────────────────  ~1-2 días
Las primeras ~2 horas (semana 1) son cambios de 5-30 minutos cada uno que eliminan deuda de accesibilidad y performance inmediata sin riesgo de regresión.