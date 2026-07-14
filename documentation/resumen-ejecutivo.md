Resumen Ejecutivo — Belleza & Estilo
Proyecto: Sitio web corporativo / landing page para un salón de belleza y estética en Córdoba.
Ruta: /beauty-salon/frontend
Stack Principal
Tecnología	Versión
Angular	^22.0.0
Tailwind CSS	^4.3.2
TypeScript	~6.0.2
RxJS	~7.8.0
Vitest	^4.0.8
PostCSS	^8.5.16
Dependencias de Producción (8)
- @angular/common, @angular/compiler, @angular/core, @angular/forms, @angular/platform-browser, @angular/router — core Angular + router + forms
- rxjs — programación reactiva
- tslib — helpers de runtime para TypeScript
Dependencias de Desarrollo (10)
- @angular/build, @angular/cli, @angular/compiler-cli — toolchain de compilación Angular
- tailwindcss, @tailwindcss/postcss, postcss — sistema de estilos
- vitest, jsdom — test runner + entorno DOM
- prettier — formateo de código
- typescript — compilador TS
Arquitectura General
src/
├── index.html
├── main.ts                          ← Bootstrap de la app (standalone)
├── styles.css                       ← Entry point CSS (importa Tailwind + tokens)
├── styles/
│   ├── tokens.css                   ← Design tokens (colores, tipografía, sombras, espaciado)
│   ├── fonts.css                    ← Fuentes self-hosted (Inter + Playfair Display)
│   └── animation.css                ← Sistema de animación completo
    
└── app/
    ├── app.ts                       ← Root component standalone
    ├── app.config.ts                ← Providers globales (router, HttpClient)
    ├── app.routes.ts                ← 2 rutas: / y 404
    ├── app.html                     ← Template raíz
    │
    ├── core/                        ← Datos, lógica de negocio y modelos
    │   ├── data/content.ts          ← Constantes de contenido (teléfono, email, redes, CTAs)
    │   ├── models/                  ← 7 modelos de datos
    │   └── services/                ← 9 servicios
    │
    ├── layout/                      ← Componentes de estructura global
    │   ├── header/
    │   ├── nav/
    │   └── footer/
    │
    ├── pages/                       ← Componentes de ruta
    │   ├── home/
    │   └── not-found/
    │
    ├── features/                    ← Secciones/componentes de landing page
    │   ├── hero/
    │   ├── about/
    │   ├── services/
    │   ├── pricing/
    │   ├── gallery/
    │   ├── team/
    │   ├── testimonials/
    │   ├── process/
    │   ├── promo/
    │   ├── booking-cta/
    │   └── contact/
    │
    └── shared/                      ← Componentes y directivas reutilizables
        ├── components/              ← 10 componentes
        └── directives/              ← 2 directivas
Patrón: Standalone Components — sin NgModule. Cada componente se declara standalone: true y se importa directamente donde se necesita. La aplicación se bootstrapa con bootstrapApplication en lugar de platformBrowserDynamic.
Routing: 2 rutas lazy-loaded (/ → HomePage, ** → NotFoundPage). La navegación es SPA con fragmentos (#servicios, #precios, etc.) para scroll a secciones.
Conteo por Categoría
Categoría	Cantidad	Detalle
Componentes	27	1 root + 3 layout + 2 páginas + 11 features + 10 shared
Páginas	2	Home, NotFound
Servicios	9	booking-api, booking, gallery, process, promo, service, team, testimonial, whatsapp-message
Modelos	7	booking, gallery-item, process-step, promotion, service, team-member, testimonial
Directivas	2	cardTilt, reveal
Pipes	0	 
Interfaces	0 (1 inline)	NavItem está definida inline en nav.ts
Propósito de Cada Módulo Principal
core/ — Capa de datos y dominio. Contiene los modelos tipados (booking.model.ts, service.model.ts, etc.), los servicios que exponen datos mockeados o preparados para API REST, y el archivo content.ts con todas las constantes del negocio (teléfono, WhatsApp, email, dirección, CTAs). El resto de la app nunca hardcodea estos valores.
layout/ — Estructura global que envuelve todas las páginas: header (barra superior), nav (menú de navegación mobile/desktop con focus trapping), footer (pie de página con datos de contacto y redes). El root component App los ensambla con RouterOutlet.
pages/ — Componentes de ruta. HomePage es el orquestador que compone las 11 secciones del landing en orden. NotFoundPage maneja el 404 con posibilidad de navegar a secciones del home mediante fragmentos.
features/ — Cada sección visual del sitio es un componente independiente:
- hero — Presentación principal con título, subtítulo y CTA
- about — Historia del salón con imagen decorativa
- services — Lista de servicios con suscripción animada
- pricing — Tabla de precios con hover effect
- gallery — Grid de imágenes con zoom
- team — Perfiles del equipo con efecto tilt
- testimonials — Reseñas de clientes
- process — Paso a paso del proceso de atención
- promo — Banner promocional/push
- booking-cta — Call-to-action principal de reserva
- contact — Formulario de contacto + datos, mapa
shared/ — Componentes reutilizables cross-feature:
- container — Wrapper de ancho máximo con padding responsive
- card / service-card / testimonial-card — Cards con distintas variantes visuales
- cta-button / whatsapp-btn — Botones de acción reutilizables
- floating-whatsapp — Botón flotante de WhatsApp con tooltip
- gallery-grid — Grid responsivo con stagger animation
- section-header — Encabezado de sección (título + subtítulo)
- svg-icon — Inline SVG component para íconos
styles/ — Sistema de diseño completo:
- tokens.css — Design tokens dentro de @theme (paleta cálida, tipografía serif+sans, espaciado, sombras con base espresso, radii, elevation system semántico)
- fonts.css — Fuentes self-hosted (Inter + Playfair Display, subset latino, woff2)
- animation.css — Sistema de animación con duraciones, easings (spring, out), keyframes (slideUp, zoomIn, popIn, lineGrow), stagger delays, y prefers-reduced-motion
environments/ — environment.ts con flag production y apiUrl listo para conectar el backend cuando exista.