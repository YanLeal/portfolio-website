Acá tenés la evaluación completa de la arquitectura Angular, aspecto por aspecto.
1. Standalone Components — 🟢 9/10
Qué encontré: 100% del proyecto usa standalone: true. No hay un solo NgModule. Usa bootstrapApplication en main.ts, que es la forma correcta en Angular 22+. Los imports de componentes se declaran inline, directos, sin intermediarios.
Fortalezas:
- Consistencia total — nunca mezcla standalone con NgModules
- app.config.ts aísla los providers correctamente (provideHttpClient, provideRouter, withInMemoryScrolling)
- Cada componente importa solo lo que necesita, ni más ni menos
Debilidades:
- WhatsappButtonComponent usa el decorador @Input() clásico en vez de la función input() signal — inconsistencia con el resto del proyecto que sí usa signals
// ❌ Inconsistente — usá input() como el resto
@Input() variant: WaVariant = 'services';
@Input() showLabel = true;

// ✅ Patrón del resto del proyecto
readonly variant = input<'base' | 'lift'>('lift');
readonly title = input.required<string>();
2. Routing — 🟢 8/10
Qué encontré: 2 rutas lazy-loaded con loadComponent:
export const routes: Routes = [
  { path: '', title: '...', loadComponent: () => import('./pages/home/home').then(c => c.HomePage) },
  { path: '**', title: '...', loadComponent: () => import('./pages/not-found/not-found').then(c => c.NotFoundPage) },
];
Fortalezas:
- Lazy loading correcto con loadComponent (no import estático) ✅
- title configurado en cada ruta para SEO ✅
- Scroll position restoration + anchor scrolling habilitado en app.config.ts ✅
- Maneja fragmentos (#servicios, #contacto) con scroll suave ✅
Debilidades:
- app.ts usa setTimeout(50ms) para esperar que el lazy route renderice el DOM antes de scrollear al fragmento. Es frágil — podría romperse en conexión lenta o componentes pesados. La alternativa moderna es afterNextRender.
- scrollTo() está duplicado en 4+ componentes (hero, about, services, booking-cta, contact, footer, nav). Debería ser un servicio (ScrollService) o un helper compartido.
- Sin provideRouter(withPreloading(PreloadAllModules)) — hoy es innecesario porque son solo 2 rutas, pero si el proyecto escala, conviene.
3. Dependency Injection — 🟢 9/10
Qué encontré: Uso casi universal de inject() en lugar de constructor injection. Todos los servicios usan providedIn: 'root'.
// ✅ Patrón dominante
private readonly http = inject(HttpClient);
private readonly serviceService = inject(ServiceService);

// ❌ Excepción (única)
constructor(private api: BookingApiService) {}   // BookingService
Fortalezas:
- inject() es tree-shakeable, más conciso, y evita this. en propiedades inyectadas ✅
- providedIn: 'root' en los 9 servicios → tree-shaking, singleton lazy ✅
- @Injectable() bien definido en todos los casos ✅
Debilidades:
- BookingService usa constructor injection — inconsistencia menor
- No hay uso de InjectionToken para configuraciones (no hace falta hoy, pero es bueno saber que existe)
- No se usa @Optional() ni @Host() — no es crítico, pero denota que no hay jerarquía de DI pensada
4. Signals — 🟢 9/10
Qué encontré: Uso extensivo de signals en toda la app — input(), output(), signal(), toSignal().
Dónde se usan:
- input(): Card, Container, SectionHeader, CtaButton, CardTiltDirective, RevealDirective, HeroComponent
- output(): NavComponent (navigated)
- signal(): HeaderComponent (isMenuOpen, isScrolled)
- toSignal(): en 7 feature components (services, gallery, team, pricing, testimonials, process, promo, contact)
- HostBinding dinámico con getter: HeaderComponent
Fortalezas:
- Adopción temprana y consistente de la API de signals ✅
- toSignal() convierte observables RxJS a signals limpiamente ✅
- Inputs tipados con genéricos input<'base' | 'lift'>() ✅
- input.required<string>() en SectionHeader ✅
Debilidades:
- WhatsappButtonComponent usa @Input() clásico con decorador — es la única pieza que no migró a signals (ver punto 1)
5. Servicios — 🟡 7/10
Qué encontré: 9 servicios en core/services/.
Fortalezas:
- Facade pattern: BookingService es una fachada → componentes hablan con BookingService, que delega a BookingApiService. Cuando el backend exista, solo cambia BookingApiService. ✅
- shareReplay(1) con caching: ServiceService, GalleryService, etc. cachean el GET HTTP con shareReplay(1) para no repetir requests. ✅
- Error handling: Todos los servicios HTTP tienen catchError con fallback a of([]). ✅
- whatsapp-message.service.ts: limpio, con interfaz WaMessageParams para tipar el contrato. ✅
Debilidades:
- 🔴 Duplicación crítica: 6 servicios (service, gallery, team, testimonial, process, promo) son prácticamente idénticos — cambia solo el tipo genérico y la URL del JSON. Esto viola DRY a nivel arquitectónico:
Servicio	URL
ServiceService	services.json
GalleryService	gallery.json
TeamService	team.json
TestimonialService	testimonial.json
ProcessService	process.json
PromoService	promotion.json
Solución clara: DataService<T> genérico con un map de endpoints y tipos. O incluso mejor: un solo ContentService que expone todos los datasets con una API unificada.
6. Interfaces / Modelos — 🟡 7/10
Qué encontré: 7 archivos de modelos en core/models/ + interfaces inline en servicios y componentes.
Fortalezas:
- Modelos tipados con interface (Service, TeamMember, BookingRequest, etc.) ✅
- Type unions para dominios cerrados: BookingStatus, ServiceCategory, WaVariant ✅
- JSDoc en booking.model.ts documentando campos ✅
- readonly fields implícitos (interfaces son inmutables por naturaleza) ✅
Debilidades:
- Interfaces inline dispersas: WaMessageParams en whatsapp-message.service.ts, NavItem en nav.ts, HeroContent en hero.ts. Deberían estar en core/models/.
- Sin barrel export (index.ts) en models/ → imports más largos de lo necesario
- Sin discriminación de tipos (no hay union types complejos entre modelos)
- Algunos modelos tienen campos que no se usan en templates (no es grave, pero indica que no hay validación contra el JSON real)
7. Organización — 🟢 9/10
Qué encontré: Estructura feature-based modular.
app/
├── core/         → datos, lógica de negocio, modelos
├── features/     → secciones visuales
├── layout/       → estructura global (header, nav, footer)
├── pages/        → componentes de ruta
└── shared/       → componentes y directivas reutilizables
Fortalezas:
- Separación clara de responsabilidades (core vs features vs shared) ✅
- Nomenclatura consistente: cada componente = carpeta con .ts + .html + .css ✅
- Sin NgModules, sin barrel exports innecesarios ✅
- host: { class: 'section-padding' } en features — patrón elegante para estilos compartidos sin herencia ✅
- app.routes.ts separado de app.config.ts ✅
Debilidades:
- ContactComponent (207 líneas, 8 métodos, 20+ propiedades) es un outlier enorme. Rompe con el tamaño promedio de los otros features (~15-20 líneas). No debería existir un componente así en una arquitectura bien modularizada.
- No hay barrel files (index.ts) en ninguna carpeta — tenés que conocer la ruta exacta de cada import
- El límite features/ vs shared/ es conceptualmente claro, pero hay casos fronterizos: booking-cta es un feature con 15 líneas que bien podría ser shared
8. Lazy Loading — 🟢 9/10
Qué encontré: Las 2 rutas usan loadComponent — el componente se carga solo cuando se navega a esa ruta.
Fortalezas:
- loadComponent en lugar de import estático = chunk separado en producción ✅
- Webpack/ESBuild puede hacer code splitting correctamente ✅
- Títulos SEO por ruta ✅
Debilidades:
- Solo 2 rutas → la evaluación es limitada porque no hay mucho que medir
- No hay withPreloading(PreloadAllModules) — si el proyecto creciera a 5+ rutas, convendría preload después del primer paint
- La ruta 404 (**) también está lazy-loaded, lo cual es discutible — una 404 debería cargar instantáneamente
9. Shared — 🟢 8/10
Qué encontré: 10 componentes + 2 directivas reutilizables.
Fortalezas:
- Componentes bien diseñados con API surfaces limpias: Card recibe variant, entranceDelay, tiltEnabled — composición, no herencia ✅
- ContainerComponent con input narrow — pequeño, enfocado, reusable ✅
- RevealDirective es una joya: IntersectionObserver, once, rootMargin configurable, output revealed, cleanup en ngOnDestroy, NgZone wrapper ✅
- CardTiltDirective: transform booleano, HostBinding limpias, mouseleave con transición suave ✅
- SectionHeader: mínimo, recibe title required y subtitle opcional ✅
Debilidades:
- WhatsappButtonComponent tiene 208 líneas de CSS inline — a ese tamaño, merece un archivo separado whatsapp-btn.css
- WhatsappButtonComponent usa @Input() decorator en vez de input() signal (inconsistente)
- Inconsistencia de templates: algunos inline (container.ts, svg-icon.ts, floating-whatsapp.ts), otros en archivo separado (card.html, cta-button.html, etc.)
- floating-whatsapp.ts es un wrapper de una sola línea que delega en WhatsappButtonComponent. Válido, pero borderline — podría ser solo un use-case de variant="floating" en el template del root
10. Core — 🟢 8/10
Qué encontré: Constantes (content.ts), 7 modelos, 9 servicios.
Fortalezas:
- content.ts centraliza strings de negocio — ningún componente hardcodea teléfono, WhatsApp, email o dirección ✅
- booking-api.service.ts tiene el mejor stub que he visto: documentado con instrucciones paso a paso para migrar a HTTP real, con console.warn para detectar que está en stub ✅
- booking.service.ts como fachada — los componentes no saben si están en stub o backend real ✅
Debilidades:
- 6 servicios HTTP duplicados (ver punto 5) — la deuda técnica más grande del core
- content.ts es un archivo plano que mezcla constantes de contacto con labels de CTA. Si el sitio escala, conviene migrar a un ContentService inyectable que pueda switchear entre locales o ser reemplazado por CMS
- Sin barrel export → imports largos y conocimiento de ruta exacta
11. Features — 🟡 7/10
Qué encontré: 11 secciones visuales independientes.
Fortalezas:
- 10 de 11 componentes son pequeños y enfocados (15-22 líneas de TS) ✅
- Patrón consistente: inject → toSignal → SectionHeader → grid/stagger ✅
- host: { class: 'section-padding' } en lugar de CSS duplicado ✅
- Importan solo lo que necesitan (cada feature importa su servicio + shared components) ✅
Debilidades:
- 🔴 ContactComponent (207 líneas): es el feature más complejo por lejos, y está todo inline — wizard de 4 pasos, validación, navegación, detección de popup bloqueado, focus management, reset, fecha mínima, horarios, servicios, todo en un solo componente. Pide a gritos ser extraído a:
- WizardStepService (estado del wizard)
- StepDirective (para sub-componentes de paso)
- O al menos template partials con @if/@else
- scrollTo() duplicado en hero, about, services, booking-cta, contact — debería ser un helper o servicio
- Datos hardcodeados en features: HeroComponent tiene defaults inline, AboutComponent tiene stats hardcodeadas, BookingCtaComponent no usa servicio — inconsistencia con el resto que sí usa data services
- Inconsistencia de patrones: algunos features tienen CSS file (la mayoría), otros no
Tabla Resumen
Aspecto	Calificación	Diagnóstico breve
Standalone Components	9/10	100% standalone. Una excepción con @Input decorator
Routing	8/10	Lazy loading ✅, setTimeout frágil, scrollTo() duplicado
Dependency Injection	9/10	inject() dominante, providedIn: root en todos. Una excepción
Signals	9/10	Adopción temprana y consistente. Misma excepción @Input
Servicios	7/10	Buen diseño individual (cache, error handling, facade). 6 duplicados DRY
Interfaces	7/10	Modelos claros. Interfaces inline dispersas. Sin barrel
Organización	9/10	Feature-based impecable. ContactComponent rompe la norma
Lazy Loading	9/10	Correcto. Poco que medir (solo 2 rutas)
Shared	8/10	Componentes bien diseñados. Inconsistencias de estilo (inline vs file)
Core	8/10	Buenas abstracciones. Deuda técnica en servicios duplicados
Features	7/10	10/11 limpios. ContactComponent es un monolito
Calificación general ponderada: 8.2/10
La arquitectura es sólida, moderna (Standalone + Signals), y está bien organizada. Las dos deudas técnicas principales son:
1. 6 servicios duplicados para lectura de JSONs → un DataService<T> genérico los unifica
2. ContactComponent monolítico → extraer wizard a sub-componentes o servicio de estado
Si resolvés esos dos puntos, la calificación sube a 9+/10 fácil.