Análisis de Rendimiento — Beauty Salon Frontend
1. Imágenes
Formato: ✅ 100% WebP. No hay JPEG, PNG, ni GIF.
Carga:
- Hero: NgOptimizedImage con priority, width/height (1920×1080), y preload con fetchpriority="high" ✅
- Galería: loading="lazy" + decoding="async" ✅
- El resto (team, services, process, promo): imágenes en template HTML que no pude ver inline pero asumo que usan <img> estándar
Peso total en producción: ~1.7MB
Grupo	Cantidad
Hero	1
About	1
Gallery	8
Services	6
Team	3
Process	4
Promo	1
Booking CTA	1
Problemas:
- ❌ Sin srcset/responsive images. La hero de 78KB se sirve igual en un iPhone SE que en un iMac 5K
- ❌ Sin AVIF, que comprime 30% más que WebP
- ❌ Sin pipeline de compresión en build. Las imágenes están "pre-optimizadas" a mano, no hay sharp/squoosh/AST en el build
- ❌ gallery-grid usa img[src] directo sin NgOptimizedImage, perdiendo optimizaciones de carga
2. Fuentes
Archivo
inter-latin.woff2
playfair-latin.woff2
playfair-latin-italic.woff2
Bueno: self-hosted (0 requests externos), font-display: swap, woff2, subset latino ✅
Malo: No hay <link rel="preload"> para las fuentes. El navegador descubre los @font-face dentro de fonts.css, que a su vez se carga desde styles.css. Cascade: index.html → styles.css (30KB) → fonts.css. Las fuentes no empiezan a descargar hasta que fonts.css se parsea.
3. Bundles (producción)
Archivo	Peso raw
chunk-SFX3TME5.js	168KB
chunk-OEOQM7JF.js	123KB
chunk-XODA4GML.js	86KB
main-YJAFVZFY.js	20KB
chunk-6QA4U5XX.js	4KB
chunk-XFOP7H6F.js	0.5KB
Total JS	~432KB (~130KB gzip)
styles-*.css	30KB (~8KB gzip)
Problemas:
- ❌ Dos chunks grandes (168KB + 123KB) que se cargan en el bundle inicial
- ❌ Sin modulepreload para las rutas lazy (HomePage, NotFound) — hoy se cargan via import() dinámico sin hint al navegador
- ❌ Sin code splitting más granular — todo lo que no son las 2 rutas lazy está en un bundle
4. Lazy Loading
Ruta
/ (HomePage)
** (NotFound)
Problemas:
- ❌ Las 11 secciones del Home se cargan todas eager en el mismo bundle porque están en la misma ruta. Con SPA de una sola página es esperable, pero se podría considerar carga diferida por viewport (IntersectionObserver para import() dinámico de componentes fuera de pantalla)
- ❌ Sin PreloadAllModules ni withPreloading — las rutas lazy se descargan bajo demanda, no en idle time
5. Core Web Vitals (estimación)
Métrica	Estado	Nota
LCP	⚠️ Regular	Hero preload ayuda, pero CSR SPA: el JS tiene que descargarse (432KB), parsearse, ejecutarse, renderizar hero
CLS	✅ Bueno	width/height en imágenes, self-hosted fonts sin FOIT/FOUT, scroll-behavior no afecta CLS
INP	✅ Bueno	Sin listeners pesados, sin bloqueos de UI
TBT	⚠️ Regular	291KB de JS non-lazy en main thread = bloqueo de pintura
El talón de Aquiles es LCP. Es una CSR SPA sin SSR/SSG. El hero no se pinta hasta que Angular termina de bootstrappear.
6. SEO
Bueno:
- ✅ Meta tags: description, viewport, charset, robots, author, theme-color
- ✅ Open Graph completo (type, site_name, title, description, url, locale, image + dimensions + alt)
- ✅ Twitter Card (summary_large_image)
- ✅ JSON-LD estructurado con schema.org/BeautySalon
- ✅ Canonical URL, lang="es-AR"
- ✅ Favicons en múltiples formatos
Falta:
- ❌ No hay sitemap.xml
- ❌ CSR SPA sin SSR — Google indexa JS, pero no tan bien como HTML estático
- ❌ Sin hreflang (aunque no aplica para un salón local argentino)
- ❌ Sin meta name="geo.*" para SEO local (aunque el JSON-LD tiene dirección)
7. Accesibilidad
Bueno:
- ✅ Skip link estilado (.skip-link)
- ✅ aria-label en secciones, botones, iconos sociales
- ✅ aria-expanded en hamburger
- ✅ focus-visible en toda la app
- ✅ :focus:not(:focus-visible) — evita focus ring en clicks
- ✅ Focus trapping en nav mobile
- ✅ Focus management en wizard (setTimeout → focus)
- ✅ autocomplete en inputs (name, tel)
- ✅ prefers-reduced-motion implementado (colapsa animaciones a 0.01ms)
- ✅ forced-colors: active para High Contrast Mode
- ✅ prefers-contrast: more
- ✅ aria-hidden en decoraciones
- ✅ Mensajes de error en formulario
- ✅ figcaption en galería
Falta/Problemas:
- ❌ Sin roles semánticos en nav (falta role="navigation" en el menú)
- ❌ Links sociales rotos: Instagram, Facebook, TikTok en footer y sidebar contacto tienen href="#" con TODO: add real link
- ❌ Sin ARIA live regions: cuando el wizard cambia de paso o se envía el formulario, los lectores de pantalla no se enteran
- ❌ Wizard step 2 solo valida día cerrado (domingo), no si se seleccionó horario — canGoNext permite avanzar sin elegir horario
- ❌ Iconos SVG inline sin focusable="false" consistente (algunos lo tienen, otros no)
- ❌ La imagen del hero tiene alt="" (correcto para decorativa), pero el aria-label="Presentación" en la sección es muy vago
8. Lista Priorizada de Mejoras
🔴 P0 — Crítico
#	Área	Qué
1	Core Web Vitals	Implementar SSR con Angular 22 (provideServerRendering) o migrar a un SSG como analog
2	Accesibilidad	Reemplazar todos los href="#" sociales con URLs reales o sacarlos si no existen
3	Images	Agregar responsive images (srcset + sizes) para hero, about, gallery, services
4	Accesibilidad	Agregar aria-live="polite" al área del wizard para anunciar cambios de paso y confirmación
🟡 P1 — Alto
#	Área	Qué
5	Images	Pipeline de compresión en build: sharp o squoosh para re-comprimir WebP automáticamente
6	Fonts	Agregar <link rel="preload" as="font" href="/fonts/inter-latin.woff2" crossorigin> en index.html
7	Images	Convertir imágenes clave a AVIF con fallback WebP (con <picture> o NgOptimizedImage)
8	Bundles	Activar withPreloading(PreloadAllModules) en router config
9	SEO	Agregar sitemap.xml con las URLs del sitio
🟢 P2 — Medio
#	Área	Qué
10	Bundles	Explorar code splitting por sección: lazy-load componentes fuera de viewport inicial con defer o IntersectionObserver
11	Images	Usar NgOptimizedImage en gallery-grid en vez de img[src] directo
12	Accesibilidad	Agregar role="navigation" al menú nav
13	Bundles	Agregar <link rel="modulepreload"> para las rutas lazy en index.html
14	Optimización	Agregar Service Worker (Angular service worker o Workbox) para cachear assets y JSON
15	SEO	Evaluar si el sitio necesita SSR vs. el CSR actual es suficiente (para un salón local, quizá sí)
🔵 P3 — Bajo / Nice to have
#	Área	Qué
16	Images	Optimizar about-1200x1350.webp (136KB) con compresión más agresiva
17	Accesibilidad	Validar wizard step 2: requerir horario además de fecha no-domingo
18	Optimización	Inline CSS crítico (~30KB) en lugar de cargarlo como archivo externo
19	Images	Agregar elementtiming al hero image para LCP measurement nativa
20	Bundles	Extraer content.ts y modelos a chunk aparte si se repiten mucho
Resumen de Salud General
Categoría	Calificación	Nota
Imágenes	🟡 6/10	WebP y lazy loading bien; sin responsive images, sin pipeline
Fuentes	🟢 8/10	Self-hosted, subset, woff2; falta preload
Bundles	🟡 6/10	Budget ok, chunks grandes sin splitting fino
Lazy Loading	🟢 7/10	Rutas lazy, pero todo el Home es eager
Core Web Vitals	🟠 5/10	CSR mata LCP; CLS bien, TBT regular
SEO	🟢 8/10	Meta, OG, JSON-LD completos; falta sitemap
Accesibilidad	🟡 6/10	Skip link, focus management, reduced-motion; faltan roles, live regions, links rotos
Optimización	🟡 5/10	Sin SSR, sin service worker, sin preload hints
Lo primero que haría: P0#2 (links sociales rotos — es una mancha de accesibilidad que se arregla en 5 minutos), P0#4 (aria-live para el wizard), y P1#6 (preload de fuentes — 1 línea de HTML).