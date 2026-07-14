Árbol completo
beauty-salon/
├── frontend/
│   ├── .atl/                              ← Skill registry (Gentle AI)
│   ├── .vscode/
│   │   ├── extensions.json
│   │   ├── launch.json
│   │   └── tasks.json
│   ├── public/
│   │   ├── assets/data/
│   │   │   ├── services.json
│   │   │   ├── team.json
│   │   │   ├── gallery.json
│   │   │   ├── testimonial.json
│   │   │   ├── process.json
│   │   │   └── promotion.json
│   │   ├── fonts/
│   │   │   ├── inter-latin.woff2
│   │   │   ├── playfair-latin.woff2
│   │   │   └── playfair-latin-italic.woff2
│   │   ├── images/
│   │   │   ├── hero.webp
│   │   │   ├── about-1200x1350.webp
│   │   │   ├── booking-cta-1400x600.webp
│   │   │   ├── clienta-satisfecha-*.webp
│   │   │   ├── tu-momento-de-brillar-*.webp
│   │   │   ├── services/          (6 imágenes)
│   │   │   ├── team/              (3 imágenes)
│   │   │   ├── gallery/           (7 imágenes)
│   │   │   ├── process/           (4 imágenes)
│   │   │   └── promo/             (1 imagen)
│   │   ├── favicon.ico
│   │   └── favicon.svg
│   │
│   ├── src/
│   │   ├── index.html
│   │   ├── main.ts
│   │   ├── styles.css             ← Entry CSS (Tailwind + tokens + anims)
│   │   │
│   │   ├── environments/
│   │   │   └── environment.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── tokens.css         ← Design tokens
│   │   │   ├── fonts.css          ← Self-hosted fonts
│   │   │   └── animation.css      ← Keyframes + utility classes
│   │   │
│   │   └── app/
│   │       ├── app.ts             ← Root component
│   │       ├── app.html           ← Template raíz
│   │       ├── app.css            ← Estilos del root
│   │       ├── app.config.ts      ← Providers globales
│   │       ├── app.routes.ts      ← Definición de rutas
│   │       └── app.spec.ts        ← Test del root
│   │
│   │       ├── core/
│   │       │   ├── data/
│   │       │   │   └── content.ts
│   │       │   ├── models/        ← 7 modelos
│   │       │   └── services/      ← 9 servicios
│   │       │
│   │       ├── layout/
│   │       │   ├── header/
│   │       │   ├── nav/
│   │       │   └── footer/
│   │       │
│   │       ├── pages/
│   │       │   ├── home/
│   │       │   └── not-found/
│   │       │
│   │       ├── features/          ← 11 secciones
│   │       │   ├── hero/
│   │       │   ├── about/
│   │       │   ├── services/
│   │       │   ├── pricing/
│   │       │   ├── gallery/
│   │       │   ├── team/
│   │       │   ├── testimonials/
│   │       │   ├── process/
│   │       │   ├── promo/
│   │       │   ├── booking-cta/
│   │       │   └── contact/
│   │       │
│   │       └── shared/
│   │           ├── components/    ← 10 shared components
│   │           └── directives/    ← 2 directivas
│   │
│   ├── angular.json
│   ├── package.json
│   ├── tsconfig.json / tsconfig.app.json / tsconfig.spec.json
│   ├── .postcssrc.json
│   ├── .prettierrc
│   ├── .editorconfig
│   ├── motion-guidelines.md
│   └── README.md
Análisis por carpeta
src/ — Raíz de la aplicación
Propósito: Entry point de la app Angular. Bootstrap, estilos globales, y el HTML raíz.
Archivo	Rol
index.html	HTML shell con SEO completo: Open Graph, Twitter Card, JSON-LD (BeautySalon), preload de hero image, self-hosted fonts, favicon, lang=es-AR
main.ts	bootstrapApplication(App, appConfig) — arranque standalone
styles.css	@import 'tailwindcss' + @import de tokens y animaciones + capa base global + utilities compartidas (btn, card, section-padding, stagger, etc.)
Dependencias: Ninguna — es el punto de entrada.
Oportunidades de mejora:
- styles.css tiene +400 líneas entre base y utilities. Varias utilities (btn-primary, section-grid, card-base) son mezcla de diseño puro con componentes. Podrían migrarse a componentes o a Tailwind plugins custom cuando el archivo crezca.
- index.html está muy completo en SEO, no tocar.
src/environments/
Propósito: Configuración de entorno. Hoy tiene solo environment.ts con production: false y apiUrl: '/api'.
Responsabilidad: Proveer la base URL del backend sin hardcodear en servicios.
Dependencias: API backend (aún no existe).
Oportunidades de mejora:
- Solo hay un archivo. Si en algún momento hay prod vs dev, necesitás separar (environment.prod.ts). Pero Angular 22+ con @angular/build maneja reemplazo de entorno — está bien dejarlo así hasta que haya backend real.
src/styles/ — Sistema de diseño
Propósito: Contiene los 3 pilares del sistema visual.
styles/tokens.css
Propósito: Design tokens dentro del bloque @theme de Tailwind v4.
Responsabilidad: Definir toda la paleta (16 colores), tipografía (2 familias con pesos), escala de fuentes, border radii, shadows (con base espresso), espaciado, elevation system semántico, y container widths.
Dependencias: tailwindcss (importado desde styles.css).
Oportunidades de mejora:
- Excelente sistema de tokens. El elevation system con semántica (rest-hover-floating) es de primera. No cambiaría nada acá.
styles/fonts.css
Propósito: Declaraciones @font-face self-hosted para Inter (300-600, latin) y Playfair Display (400-700, latin + italic 400).
Responsabilidad: Cargar tipografía sin depender de Google Fonts ni redes externas. Mejora privacidad, performance, y disponibilidad offline.
Dependencias: Archivos woff2 en public/fonts/.
Oportunidades de mejora: Ninguna. Está impecable.
styles/animation.css
Propósito: Sistema completo de animación: duraciones (5 niveles), easings (in/out/spring), 12 keyframes (fadeIn, slideUp, zoomIn, popIn, lineGrow, etc.), utility classes (.anim-slide-up, .anim-delay-3), y respeto a prefers-reduced-motion.
Responsabilidad: Ser el único source of truth para animaciones en el proyecto.
Dependencias: Ninguna directa. La documentación de uso está en motion-guidelines.md.
Oportunidades de mejora:
- Está muy bien diseñado. Las utility classes .anim-hidden + [appReveal] forman un patrón sólido.
- prefers-reduced-motion usa 0.01ms !important que es la técnica correcta. ✅
src/app/ — Root component
Propósito: Punto de montaje de Angular. Bootstrapa el root standalone component.
Archivos:
Archivo	Rol
app.ts	Escucha eventos de router, hace scroll to top o a fragmentos con smooth
app.html	Template: skip-link + Header + RouterOutlet + FloatingWhatsapp + Footer
app.config.ts	provideHttpClient(), router con scroll restoration + anchor scrolling, global error listeners
app.routes.ts	2 rutas lazy: / → HomePage, ** → NotFoundPage
app.spec.ts	Smoke test de creación
Dependencias: layout components (Header, Footer), FloatingWhatsapp (shared).
Oportunidades de mejora:
- app.ts usa setTimeout(50ms) para scroll a fragmentos. Es un hack frágil — si la lazy route tarda más, el elemento no existe. Podría mejorarse con un afterNextRender o un pequeño helper que reintente hasta que el elemento esté en el DOM.
- app.spec.ts es solo un smoke test. Podría testear que los componentes layout se renderizan.
src/app/core/ — Capa de dominio y datos
Propósito: Aislar toda la lógica de negocio, datos y modelos del resto de la app.
core/data/content.ts
Propósito: Constantes de contenido del negocio.
Responsabilidad: Centralizar en UN solo lugar: nombre del salón, URL, teléfono (display + tel), WhatsApp number, email, dirección, redes sociales, y labels de CTAs. El resto de la app nunca hardcodea un string de negocio.
Dependencias: Ninguna. Es constantes planas.
Oportunidades de mejora:
💡 Crítica importante: Esto es una solución intermedia. Los strings de negocio están acá (bien), pero los textos largos de cada sección están hardcodeados en los HTML templates de cada feature component (hero, about, etc.). Para un sitio multilenguaje o que necesite edición externalizada, convendría migrar TODO el contenido a un archivo JSON (por ejemplo public/assets/data/content.json) y servirlo como un ContentService que inyecte los textos.
- Hoy: content.ts tiene un mix de constantes de contacto + labels de CTA. Está bien como MVP.
- Mañana: Si querés i18n, migrar a JSON + service.
core/models/ (7 archivos)
Archivo	Propósito
booking.model.ts	BookingRequest, BookingResponse, BookingConfirmation, BookingStatus (type union)
service.model.ts	SalonService — id, name, description, duration, price, image
gallery-item.model.ts	GalleryItem — id, src, alt, category
team-member.model.ts	TeamMember — id, name, role, image, bio
testimonial.model.ts	Testimonial — id, name, text, rating, image
process-step.model.ts	ProcessStep — id, step number, title, description, image
promotion.model.ts	Promotion — id, title, description, image, validUntil
Dependencias: Ninguna. Son interfaces y tipos planos.
Oportunidades de mejora:
- Algunos modelos usan interface, otros podrían migrar a type. Es inconsistente pero funcional.
- Sugerencia: agregar readonly en campos que no mutan (todos). es tipado extra barato.
core/services/ (9 archivos)
Servicio	Rol
booking-api.service.ts	Stub de API REST — simula llamadas con of().pipe(delay()). Tiene instrucciones para conectar HttpClient cuando exista backend
booking.service.ts	Fachada entre componentes y API layer. Los componentes usan este servicio, no BookingApiService directamente
service.service.ts	Retorna servicios desde public/assets/data/services.json
gallery.service.ts	Retorna items de galería desde JSON
team.service.ts	Retorna miembros del equipo desde JSON
testimonial.service.ts	Retorna testimonios desde JSON
process.service.ts	Retorna pasos del proceso desde JSON
promo.service.ts	Retorna promociones desde JSON
whatsapp-message.service.ts	Construye mensajes de WhatsApp structurados y genera URL wa.me con texto prearmado
Dependencias: HttpClient (via app.config.ts), @angular/common/http, modelos en core/models/.
Oportunidades de mejora:
💡 Mejora importante: Los servicios que leen JSON (service.service, gallery.service, etc.) tienen lógica casi idéntica (HTTP GET a /assets/data/*.json). Hay una oportunidad clara de refactorizar a un base service o incluso a un solo DataService genérico con un map de endpoints. Hoy hay 6 servicios que hacen la misma operación con distinto tipo.
- booking-api.service.ts es un stub excelente — documentado, con instrucciones de migración, timeout simulado. ✅
- booking.service.ts sigue el patrón Fachada correctamente. Los componentes nunca saben si están hablando con un stub o con el backend real. ✅
- whatsapp-message.service.ts está limpio, pero el método buildText() construye con concatenación. Para mensajes más complejos, un template string multilínea o un objeto de configuración sería más mantenible.
src/app/layout/ — Estructura global
Propósito: Componentes que envuelven toda la aplicación, presentes en todas las páginas.
header/
Responsabilidad: Header sticky con logo, menú mobile, detección de scroll (transparente → sólido). Usa signals para estado reactivo.
Dependencias: NavComponent, RouterLink, content.ts.
Oportunidades de mejora:
- El listener de scroll en el constructor funciona pero Angular tiene mejores herramientas: fromEvent de rxjs o un ScrollService centralizado si otras secciones necesitan saber el scroll. Hoy está bien como está.
- @HostBinding('class.transparent') y @HostBinding('class.solid') funcionan, pero en Angular 17+ existen host: { class: '...' } dinámico.
nav/
Responsabilidad: Menú de navegación desktop/mobile con focus trapping en el panel mobile. Navega por fragmentos (#servicios, #precios) con scroll suave y fallback a ruta.
Dependencias: Router, content.ts (CTA label).
Oportunidades de mejora:
- onPanelKeydown() implementa focus trapping manual. Funciona bien pero es verboso. Para Angular, hay patrones más limpios con @angular/cdk/a11y si se agrega CDK.
- querySelectorAll('a[href], button, ...') funciona pero sería más declarativo con template reference variables.
footer/
Responsabilidad: Pie de página con datos de contacto, horarios, links rápidos, copyright y botón de WhatsApp.
Dependencias: Router, WhatsappButtonComponent, content.ts.
Oportunidades de mejora: Ninguna crítica. Está limpio y bien estructurado.
src/app/pages/ — Componentes de ruta
Propósito: Componentes que se cargan por cada ruta de la app.
home/
Responsabilidad: Orquestar las 11 secciones en orden (hero → about → gallery → services → pricing → team → promo → process → testimonials → booking-cta → contact), separadas por section-divider.
Dependencias: Los 11 feature components.
Oportunidades de mejora:
- home.ts es un componente pasivo (no tiene lógica). Perfecto ✅
- home.html es una secuencia lineal de componentes con divisores. Claro y mantenible. ✅
not-found/
Responsabilidad: Página 404 con navegación a secciones del home mediante fragmentos.
Dependencias: Router.
Oportunidades de mejora: Ninguna. Es simple y funcional.
src/app/features/ — Secciones del landing page
Propósito: Cada componente de feature representa una sección visual completa de la landing page. Son componentes standalone, inyectados directamente en home.html.
hero/
- Rol: Presentación principal con título, tagline, descripción, CTA principal y botón secundario.
- Inputs: content con defaults inline (businessName, tagline, description, etc.).
- Dependencias: RevealDirective, WhatsappButtonComponent, NgOptimizedImage.
- Mejora: Los textos default están hardcodeados en el componente. Si en algún momento cambia el contenido del sitio, hay que tocar código.
about/
- Rol: Sección "Sobre nosotros" — historia del salón con estadísticas decorativas.
services/
- Rol: Grid de servicios usando ServiceCardComponent. Inyecta ServiceService.
- Dependencias: ServiceService, ServiceCardComponent, SectionHeader.
pricing/
- Rol: Tabla de precios con lista de servicios y montos.
gallery/
- Rol: Grid de fotos usando GalleryGridComponent. Inyecta GalleryService.
- Dependencias: GalleryService, GalleryGridComponent, SectionHeader.
team/
- Rol: Perfiles del equipo con CardTiltDirective. Inyecta TeamService.
- Dependencias: TeamService, CardTiltDirective, SectionHeader.
testimonials/
- Rol: Reseñas de clientes con TestimonialCardComponent. Inyecta TestimonialService.
process/
- Rol: Paso a paso del proceso de atención. Inyecta ProcessService.
promo/
- Rol: Banner promocional destacado. Inyecta PromoService.
booking-cta/
- Rol: Call-to-action grande para reservar turno.
contact/
- Rol: Sección de contacto más wizard de reserva de 4 pasos (Servicio → Fecha → Datos → Confirmar). Envía vía WhatsApp. Inyecta ServiceService y WhatsappMessageService.
Dependencias transversales de features: SectionHeader (compartido), servicios de datos desde core/services/.
Oportunidades de mejora (generales para features):
1. Duplicación de patrones: 7 de 11 features siguen el mismo patrón: SectionHeader + grid de cards con stagger + data desde un servicio. Hay una oportunidad de crear componentes template-driven o un sistema de secciones configurable (un array de config que genere las secciones). No lo haría hoy, pero es un refactor para cuando pase de 15 secciones.
2. ContactComponent es el más complejo: tiene un wizard de 4 pasos con toda la lógica de estados inline en el componente. Con +200 líneas y lógica de navegación, validación, cálculo de fechas, manejo de popups bloqueados, foco, y reset — está pidiendo a gritos ser extraído a un WizardService o a un WizardContainer con sub-componentes por paso. Es la deuda técnica más notoria del proyecto.
3. Varios features tienen scrollTo() duplicado (hero, contact, etc.). Es candidato a un helper compartido o un ScrollService.
src/app/shared/ — Componentes y directivas reutilizables
Propósito: Todo lo que se reutiliza entre 2 o más features.
shared/components/ (10)
Componente	Tipo	CSS template
card/	✅ sí	Base de card reutilizable
container/	no (inline template)	Wrapper de ancho max con padding responsive, input narrow
cta-button/	✅ sí	Botón CTA reutilizable
floating-whatsapp/	inline template	Botón flotante de WhatsApp con tooltip
gallery-grid/	✅ sí	Grid responsivo de imágenes con overlay
section-header/	✅ sí	Título + subtítulo + línea decorativa para cada sección
service-card/	✅ sí	Card de servicio con imagen, nombre, duración, precio
svg-icon/	inline template	Inline SVG component para íconos
testimonial-card/	✅ sí	Card de testimonio con quote, nombre, rating
whatsapp-btn/	inline template	Botón que abre WhatsApp link con número + texto
Dependencias: Directiva appReveal (usada en cards), content.ts (WhatsApp number).
Oportunidades de mejora:
- Algunos componentes tienen inline template (sin templateUrl), otros tienen archivo .html separado. No es urgente unificarlo, pero la inconsistencia visual puede molestar en mantenimiento.
- container.ts es un wrapper puro de layout. Podría ser una directiva en vez de componente.
- whatsapp-btn.ts vs floating-whatsapp.ts: hay dos componentes muy similares. Podrían unificarse con un input variant="floating".
shared/directives/ (2)
Directiva	Propósito
reveal.directive.ts	IntersectionObserver que agrega una animación CSS cuando el elemento entra al viewport. Inputs: animationClass, rootMargin, once. Output: revealed.
card-tilt.directive.ts	Efecto 3D tilt que sigue el mouse sobre el elemento host. Input: toggle on/off.
Dependencias: Ninguna (son puramente DOM).
Oportunidades de mejora:
- RevealDirective es excelente. Bien documentada con JSDoc, inputs tipados, soporte para repeat, cleanup en ngOnDestroy, manejo de NgZone para output. ✅
- CardTiltDirective también está muy bien: transform booleano manual, HostBinding limpias, mouseleave con transición suave. ✅
- 💡 La función booleanTransform está duplicada inline. Si aparece una tercera directiva con transform booleano, extraer a un utility.
public/ — Archivos estáticos
Propósito: Assets servidos directamente por el build de Angular sin pasar por el bundler.
public/assets/data/ (6 JSONs)
Propósito: Datos mock del negocio — servicios, equipo, galería, testimonios, proceso, promociones. Los servicios en core/services/ hacen fetch de estos JSONs via HttpClient.
Dependencias: Servicios en core/services/.
Oportunidades de mejora:
- Cuando el backend exista, estos JSONs se reemplazan por llamadas API reales. La migración es trivial porque los servicios ya están diseñados para eso.
- Los nombres de archivo son inconsistentes: testimonial.json vs process.json vs promotion.json. Tres naming conventions distintas. Unificar a plurals o singular, pero decidir.
public/assets/fonts/
Propósito: Archivos woff2 de Inter (variable 300-600) y Playfair Display (400-700 + italic 400). Subset latin.
Dependencias: Declaraciones @font-face en styles/fonts.css.
Oportunidades de mejora: Ninguna. Self-hosted fonts es la práctica correcta.
public/assets/images/
Propósito: Imágenes optimizadas en WebP con naming que incluye dimensiones (hero.webp, about-1200x1350.webp, services/corte-de-cabello-1200x900.webp).
Dependencias: Componentes que referencian las URLs directamente en templates HTML.
Oportunidades de mejora:
- Las imágenes referencian rutas absolutas (/images/hero.webp) en templates HTML en vez de usar NgOptimizedImage con rutas relativas. Revisar cada template para asegurar consistencia.
- Algunas imágenes del root (clienta-satisfecha-saliendo-800x600.webp, reserva-tu-turno-800x600.webp, tu-momento-de-brillar-800x600.webp) parecen no estar referenciadas en ningún template. Podrían ser sobrantes.
- Considerar un ImageService que centralice las rutas (como content.ts hace con los strings). Hoy las URLs están hardcodeadas en los templates HTML.
Archivos raíz del frontend
Archivo	Propósito
angular.json	Build con @angular/build:application, builder standalone. Styles: styles.css + fonts.css. Assets: public/
package.json	Dependencias listadas arriba. Package manager: npm@11.16.0 (mailto:npm@11.16.0)
tsconfig.json	Target ES2022, module preserve, strict mode, standalone components
tsconfig.app.json	Root dir src/, incluye *.ts
tsconfig.spec.json	Vitest types
.postcssrc.json	Plugin @tailwindcss/postcss
.prettierrc	printWidth 100, singleQuote, parser angular para HTML
.editorconfig	Indent 2 espacios, UTF-8, trim trailing whitespace, single quotes en TS
.vscode/	Extensiones recomendadas, launch configs, tasks de build
motion-guidelines.md	Documentación completa del sistema de animación: duraciones, easings, cuándo/no animar, checklist de review
.atl/	Skill registry para Gentle AI
Resumen de las mejoras más importantes
Prioridad	Mejora	Dónde
🔴 Alta	Extraer lógica del wizard de ContactComponent a sub-componentes o servicio	features/contact/ (207 líneas, 8 responsabilidades distintas)
🔴 Alta	Refactorizar 6 DataServices redundantes a un solo servicio genérico	core/services/
🟡 Media	Centralizar contenido de secciones (textos largos) en JSON externo	features/*/ + core/data/content.ts
🟡 Media	Reemplazar setTimeout de scroll a fragmentos por afterNextRender	app.ts
🟡 Media	Unificar naming de JSONs (testimonial.json vs process.json vs promotion.json)	public/assets/data/
🟢 Baja	Unificar WhatsApp button components (floating vs inline)	shared/components/whatsapp-btn/ + floating-whatsapp/
🟢 Baja	Extraer booleanTransform a utility compartida	shared/directives/
🟢 Baja	Migrar inline templates a archivos separados para consistencia	shared/components/
