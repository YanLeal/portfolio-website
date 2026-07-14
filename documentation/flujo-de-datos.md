Flujo de Datos — Beauty Salon Frontend
1. Diagrama de fuentes
┌──────────────────────────────────────────────────────────────────┐
│                         FUENTES DE DATOS                         │
├────────────────┬──────────────────────┬─────────────────────────┤
│   JSON files   │   content.ts         │   Hardcodeado en        │
│   (6 archivos) │   (constantes)       │   componentes           │
├────────────────┼──────────────────────┼─────────────────────────┤
│ services.json  │ SITE_NAME            │ AboutComponent.stats    │
│ team.json      │ WHATSAPP_NUMBER      │ ContactComponent.slots  │
│ testimonial.json│ PHONE_DISPLAY       │ ContactComponent.pasos  │
│ gallery.json   │ EMAIL                │ Hero defaults           │
│ process.json   │ ADDRESS              │ Promo placeholder       │
│ promotion.json │ CTA_RESERVAR         │ BookingCta sin datos    │
│                │ CTA_NAV_WHATSAPP     │                         │
│                │ CTA_CONSULTA_WHATSAPP│                         │
└────────────────┴──────────────────────┴─────────────────────────┘
2. De JSON a componente — el pipeline completo
Cada JSON sigue exactamente el mismo patrón. No hay variación entre servicios:
JSON en /public/assets/data/
        │
        ▼
  HttpClient.get()           ← service.service.ts (todos iguales)
        │
        ▼
  .pipe(shareReplay(1))      ← cachea en memoria, un solo request
        │
        ▼
  catchError → of([])        ← falla silencioso, devuelve array vacío
        │
        ▼
  Observable<Model[]>        ← expuesto como método público
        │
        ▼
  toSignal(obs$, { initialValue: [] })   ← en cada feature component
        │
        ▼
  Signal<Model[]>            ← reactivo, el template usa @for
Los 6 servicios JSON y su contraparte:
JSON	Service	Model	Componentes consumidores
services.json (6 servicios)	ServiceService	Service	ServicesComponent, PricingComponent, ContactComponent
team.json (3 miembros)	TeamService	TeamMember	TeamComponent
testimonial.json (3 reseñas)	TestimonialService	Testimonial	TestimonialsComponent
gallery.json (8 imágenes)	GalleryService	GalleryItem	GalleryComponent
process.json (4 pasos)	ProcessService	ProcessStep	ProcessComponent
promotion.json (1 promo)	PromoService	Promotion	PromoComponent
Características clave del pipeline:
- shareReplay(1): hacen un solo GET HTTP, cachean, y cualquier subscriptor posterior recibe los datos sin pedirlos de nuevo
- catchError → of([]): si el JSON no carga (404, network error), nadie se entera — el componente recibe array vacío
- toSignal: puente Observable → Signal. El componente usa readonly data = toSignal(service.getAll(), { initialValue: [] }) y el template itera con @for
3. Qué está hardcodeado
Dato	Dónde	Líneas	Nota
WhatsApp link base	WhatsappButtonComponent.waLink	195	Toma número de content.ts, ok
CTA labels	content.ts (CTA_RESERVAR, CTA_NAV_WHATSAPP, CTA_CONSULTA_WHATSAPP)	16-18	Ok, son constantes
Stats del About	AboutComponent.stats	21-25	[{ value: '10+', label: 'Años...' }, ...] — está en el código
Horarios del wizard	ContactComponent.schedule	30	String fijo 'Lun a Sáb: 9:00 – 20:00'
Slots horarios	ContactComponent.morningSlots / afternoonSlots	32-33	['09:00','10:00','11:00'] y ['14:00','15:00','16:00','17:00']
Labels del wizard	ContactComponent.pasoLabels	26	['Servicio', 'Fecha', 'Datos', 'Confirmar']
Hero content defaults	HeroComponent.content.input	22-29	businessName, tagline, description, ctas con defaults inline
Promo placeholder	PromoComponent.PLACEHOLDER_PROMO	9-18	Objeto vacío para que no explote mientras carga
Número WhatsApp	content.ts WHATSAPP_NUMBER	7	Posta, es constante
Redes sociales	content.ts INSTAGRAM_URL, FACEBOOK_URL	12-13	Ok
Datos del footer	FooterComponent (no leído pero mencionado)	—	Horarios, links, datos de contacto
Booking success text	booking-api.service.ts stub	51	Mensaje hardcodeado: 'Turno recibido...'
Booking ID	booking-api.service.ts create()	49	Genera ID volátil TURNO-${Date.now().toString(36)} — no persiste
Social links (team)	team.json	10-12	Todos "#" — placeholder
4. Qué usa JSON
TODO el contenido dinámico del sitio está en JSON. No hay base de datos, no hay API:
Archivo	Propósito
services.json	Catálogo de 6 servicios (corte, color, manicuría, etc.)
team.json	3 miembros del equipo con bio, foto, redes
testimonial.json	3 reseñas con rating, texto, fecha
gallery.json	8 imágenes con metadata (src, alt, categoría)
process.json	4 pasos del proceso (icono, título, descripción)
promotion.json	1 promoción activa del mes
6 archivos JSON, ~235 líneas total. Es manejable ahora pero no escala — agregar un servicio nuevo implica editar JSON + regenerar imágenes.
5. Qué usa Signals
Los features consumidores. Todos siguen el mismo patrón toSignal:
Componente	Signal	Fuente
ServicesComponent	services = toSignal(serviceService.getAll(), ...)	ServiceService → JSON
PricingComponent	services = toSignal(serviceService.getAll(), ...)	ServiceService → JSON
GalleryComponent	images = toSignal(galleryService.getAll(), ...)	GalleryService → JSON
TeamComponent	team = toSignal(teamService.getAll(), ...)	TeamService → JSON
TestimonialsComponent	testimonials = toSignal(testimonialService.getAll(), ...)	TestimonialService → JSON
ProcessComponent	steps = toSignal(processService.getAll(), ...)	ProcessService → JSON
PromoComponent	promo = toSignal(promoService.getCurrent(), ...)	PromoService → JSON
ContactComponent	services = toSignal(serviceService.getAll(), ...)	ServiceService → JSON
No hay Signals que no vengan de servicios. Son todas transformaciones de Observable a Signal en el componente. Los servicios usan puramente RxJS (Observable + pipe).
6. Qué usa Services
7 servicios con responsabilidades bien definidas + 2 de booking:
Servicio	Responsabilidad	Tipo
ServiceService	CRUD de servicios (getAll, getById, getByCategory, getPopular)	HTTP → JSON
TeamService	getAll, getById	HTTP → JSON
TestimonialService	getAll + transform date string → Date	HTTP → JSON
GalleryService	getAll, getByCategory	HTTP → JSON
ProcessService	getAll	HTTP → JSON
PromoService	getCurrent (un solo objeto)	HTTP → JSON
WhatsappMessageService	Construir URLs y textos de WhatsApp	Sin HTTP — pura lógica
BookingService	Fachada para BookingApiService	Fachada
BookingApiService	Stub de API REST (create/get/cancel)	Stub — sin backend
El patrón de servicios JSON es clonado 6 veces con el mismo boilerplate HTTP:
private readonly allX$ = this.http.get<X[]>(url).pipe(
  shareReplay(1),
  catchError(...)
);
Hay exactamente 0 endpoints reales. Todo es assets/data/*.json.
7. Qué falta desacoplar
🔴 CRÍTICO — Datos hardcodeados que deberían estar en JSON o content.ts
Qué está hardcodeado	Dónde	Problema
Slots horarios (morningSlots, afternoonSlots)	ContactComponent líneas 32-33	Si el salón cambia horarios, hay que editar código TS
Schedule text ('Lun a Sáb: 9:00 – 20:00')	ContactComponent línea 30	Ídem, debería estar en content.ts
Labels del wizard (pasoLabels)	ContactComponent línea 26	Bajo impacto, pero rompe la extracción a contenido editable
Stats de About ([{value:'10+', label:'Años...'}, ...])	AboutComponent líneas 21-25	Si cambian, editar código. Debería ser JSON o content.ts
Hero defaults	HeroComponent input default 22-29	Menor, el input permite override. Pero los defaults están en código
Social links del team	team.json	Todos son "#" — placeholders que nunca se actualizaron
🟡 MEDIO — Duplicación de pipeline HTTP
Los 6 servicios JSON son copia-pega con diferente URL y tipo. Podrían compartir un BaseJsonService<T> o un helper:
// Hoy — 6 archivos casi idénticos
class ServiceService { http.get('assets/data/services.json').pipe(shareReplay(1)) }
class TeamService    { http.get('assets/data/team.json').pipe(shareReplay(1)) }
class GalleryService { http.get('assets/data/gallery.json').pipe(shareReplay(1)) }
// ...etc
Propuesta:
// Opción A: función factory
function jsonService<T>(url: string) {
  return inject(HttpClient).get<T>(url).pipe(shareReplay(1), catchError(() => of([])));
}

// Opción B: base class
class JsonService<T> {
  protected getAll(url: string) { return this.http.get<T[]>(url).pipe(shareReplay(1))... }
}
🟡 MEDIO — ServiceService se usa desde 3 componentes distintos
ServiceService.getAll() es llamado por ServicesComponent, PricingComponent, y ContactComponent. Con shareReplay(1) hacen un solo request, pero cada componente tiene su propia Signal y no comparten estado. Si un componente modifica datos (no hoy, pero en el futuro), los otros no se enteran.
🟢 BAJO — El booking es todo stub
BookingApiService entero (87 líneas) es of(stub).pipe(delay(...)). La fachada BookingService está lista pero nunca se llama desde el template — ContactComponent usa WhatsappMessageService directo, sin pasar por BookingService ni BookingApiService. El wizard construye una URL de WhatsApp y abre una ventana, nunca envía datos a un backend.
🟢 BAJO — content.ts y modelos viven en la misma carpeta
core/data/content.ts y core/models/*.ts están separados, pero no hay una convención clara de qué va dónde. content.ts mezcla constantes de negocio (teléfono, dirección) con CTAs de UI (CTA_RESERVAR). Separarlos por dominio mejoraría.
8. Resumen visual del flujo
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  JSON files  │────▶│  Services (7)    │────▶│  Signals        │
│  (6 archivos)│     │                  │     │  (toSignal)     │
│              │     │  shareReplay(1)  │     │  initialValue[] │
│              │     │  catchError → [] │     │                 │
└──────────────┘     └──────────────────┘     └────────┬────────┘
                                                        │
┌──────────────┐     ┌──────────────────┐               │
│  content.ts  │────▶│  Componentes     │◀──────────────┘
│  (constantes)│     │  → Template      │
│              │     │  → @for (data()) │
└──────────────┘     └──────────────────┘
                            │
                    ┌───────┴────────┐
                    ▼                ▼
            ┌────────────┐   ┌──────────────┐
            │ Shared     │   │ Booking      │
            │ Components │   │ (stub —      │
            │ (inputs)   │   │  sin backend)│
            └────────────┘   └──────────────┘
En criollo: todo el contenido "dinámico" viene de 6 JSONs planos que se sirven como archivos estáticos. El flujo es lineal y predecible: JSON → HttpClient → Observable cacheado → Signal → Template. No hay estado global, no hay mutations, no hay backend. Los pocos datos hardcodeados que quedan están en content.ts (bien) o directamente en componentes (mal — About stats, horarios del wizard).