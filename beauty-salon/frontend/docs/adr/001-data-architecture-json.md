# ADR-001: Arquitectura de Datos basada en JSON

**Estado:** Aceptada  
**Fecha:** 2026-07-13  
**Decisores:** Yanet Leal, equipo de desarrollo  
**Última revisión:** 2026-07-13  

---

## Contexto

La aplicación es un SPA Angular (v22) full-stack sin backend propio — los datos
se sirven como archivos estáticos desde `public/assets/data/`. Cada sección de
la página (hero, header, footer, about, servicios, galería, etc.) necesita
datos para renderizarse: textos, imágenes, horarios, configuraciones.

Históricamente los datos se organizaron en dos grandes archivos:

- `business.json` — datos del negocio (nombre, contacto, horarios, redes, SEO)
- `content.json` — contenido editorial de secciones (headers, about, stats)

Cada componente inyectaba directamente estos services de dominio y navegaba
`data().site.name` o `data().about.paragraphs` para obtener lo que necesitaba.

Este enfoque generó tres problemas:

1. **Acoplamiento.** Un componente de footer conocía la estructura completa de
   `BusinessConfig` y `NavigationData`. Cambiar la forma de `business.json`
   podía romper el footer sin relación directa.

2. **Reactividad imprecisa.** Componentes que leían `data().site.name`
   dependían de la señal `data()` completa. Un cambio en `contact.whatsapp`
   marcaba como sucio al componente del header, aunque el header solo leyera
   `site.name`.

3. **Crecimiento desordenado.** A medida que crecían las secciones,
   `content.json` se convertía en un archivo gigante con datos de dominios
   distintos (hero, about, services, pricing, gallery, team, testimonials,
   process), todos en el mismo archivo y cargados por el mismo service.

---

## Problema

> ¿Cómo organizar los datos estáticos de una SPA multi-sección para que cada
> sección sea autónoma, los datos tengan una única fuente de verdad, y la
> reactividad sea precisa sin acoplar componentes a estructuras que no les
> corresponden?

### Requisitos

- Cada sección visual debe poder cargar sus datos de forma independiente.
- Los datos compartidos (nombre del negocio, horarios, contacto) deben tener
  una única fuente de verdad, no copias en cada archivo de sección.
- Un componente solo debe re-renderizarse cuando cambian los datos que
  realmente lee, no cuando cambia cualquier parte del estado global.
- La solución debe funcionar sin un backend — archivos estáticos servidos por
  el mismo CDN que el bundle de Angular.
- El mecanismo de carga debe ser simple, sin dependencias externas pesadas.

---

## Alternativas consideradas

### Alternativa 1: Un solo JSON gigante con todo el contenido

Un único archivo `data.json` con todas las secciones. Un solo service lo
carga y expone como signal. Cada componente navega el sub-árbol que necesita.

**Ventajas:**
- Una sola request HTTP.
- Un solo service que inyectar.

**Desventajas:**
- Si una sección cambia, se invalida la cache de todo el archivo.
- El service crece sin límite.
- Reactividad imprecisa: cualquier cambio en cualquier parte del JSON marca
  como sucios a todos los componentes que leen la señal.
- El archivo es difícil de mantener con muchas secciones.

**Veredicto:** Rechazada. Es exactamente el problema que tenemos hoy con
`content.json` pero llevado al extremo.

### Alternativa 2: CMS headless (Strapi, Sanity, Contentful)

Los datos se sirven desde un CMS externo vía REST API o GraphQL. Cada
sección tiene su propio endpoint o query.

**Ventajas:**
- Editor visual para contenido.
- Cache y CDN manejados por el CMS.
- Los datos no se mezclan con el código fuente.

**Desventajas:**
- Introduce una dependencia externa (un backend que antes no existía).
- Complejidad operativa: hosting, auth, backups, CI/CD.
- Overkill para una SPA sin backend que sirve contenido mayormente estático.
- Costo recurrente.

**Veredicto:** Rechazada. La aplicación no necesita un CMS. El contenido es
manejado por el equipo de desarrollo y cambia con poca frecuencia.

### Alternativa 3: Un JSON por sección, cada uno autocontenido

Cada sección visual tiene su propio archivo JSON con **todos** los datos que
necesita, incluyendo los compartidos (siteName, schedule, etc.).

**Ventajas:**
- Cada sección es completamente autónoma — un solo service, un solo fetch.
- El componente inyecta un solo service.
- Mínimo acoplamiento.

**Desventajas:**
- Duplicación masiva de datos compartidos. "Belleza & Estilo" aparece en 6
  archivos. "Reservá tu turno" aparece en 4.
- Si el nombre del negocio cambia, hay que actualizar 6 archivos.
- Riesgo de inconsistencia (un archivo con "Belleza & Estilo", otro con
  "Belleza y Estilo").
- Más requests HTTP (uno por sección).

**Veredicto:** Rechazada como estrategia única, pero adoptada parcialmente
para los datos exclusivos de cada sección. Es la base de la decisión final
pero combinada con composición para evitar duplicación.

### Alternativa 4: Two-layer con composición en services (elegida)

Dos tipos de archivos:

- **Entity JSONs:** pocos archivos, cada uno es autoridad única de una entidad
  del mundo real (business, navigation, content).
- **Section JSONs:** un archivo por sección visual, contiene **solo** los
  campos exclusivos de esa sección.

Los feature services inyectan los entity services y componen la señal final
con `computed`. El componente inyecta un solo service.

**Ventajas:**
- Datos compartidos tienen una única fuente de verdad.
- Cada sección es autónoma desde la perspectiva del componente.
- Reactividad granular: los computeds crean boundaries de reactividad.
- Sin dependencias externas.
- Cada archivo JSON es pequeño y enfocado.

**Desventajas:**
- Más services que inyectar internamente (composición).
- Un poco más de código en los feature services (el `computed` de unión).
- Múltiples requests HTTP iniciales (uno por sección + entidades).

**Veredicto:** Elegida.

---

## Decisión

Adoptar una arquitectura de datos en dos capas, con JSONs de entidad como
fuente de verdad y JSONs de sección como proyecciones de vista, conectados
por services que componen mediante signals y computeds.

### Reglas

#### Regla 1: Dos tipos de JSON

| Tipo | Propósito | Número esperado | Ejemplos |
|---|---|---|---|
| Entity | Autoridad única de datos compartidos | 3-5 | `business.json`, `content.json`, `navigation.json` |
| Section | Datos exclusivos de una sección visual | 1 por sección | `hero.json`, `header.json`, `footer.json` |

#### Regla 2: Composición, no duplicación

Un section JSON **nunca** contiene un campo que ya exista en un entity JSON.
Los feature services componen usando `computed`:

```typescript
// ✅ Bien — el section JSON tiene solo campos únicos
// header.json → { logoAriaLabel, menuOpenLabel, menuCloseLabel, menuAriaLabel }

// El service compone con business.json para obtener siteName
class HeaderService {
  private readonly businessService = inject(BusinessService);

  private readonly headerData = signal<HeaderData>(FALLBACK);
  readonly data = computed(() => ({
    siteName: this.businessService.data().site.name,
    ...this.headerData(),
  }));
}
```

#### Regla 3: Un service por sección, expone tres señales

```typescript
readonly data:    Signal<T>   // los datos, nunca undefined
readonly loading: Signal<boolean> // true hasta que resuelva
readonly error:   Signal<string | null> // null si OK
```

#### Regla 4: Transporte con fetch nativo

Los feature services nuevos usan `fetch()` en vez de `HttpClient` + RxJS.

#### Regla 5: Fallback completo

Cada service define un objeto `FALLBACK: T` con todas las propiedades en
strings vacíos / arrays vacíos. `data` nunca es `undefined`.

### Casos de uso

| Situación | Cómo se maneja |
|---|---|
| Cambia el nombre del negocio | Se edita solo `business.json`, todos los componentes lo reflejan |
| Nueva sección visual | Se crea su JSON (solo campos únicos), su service, se compone con entity services |
| Se agrega un campo a una sección | Se agrega al JSON de sección y al modelo |
| Un campo se vuelve compartido entre secciones | Se mueve al entity JSON correspondiente, se actualiza el computed |
| Error de carga | `error` signal se setea, el componente muestra estado de error |
| Loading state | `loading` signal permite mostrar skeletons |

---

## Consecuencias

### Positivas

1. **Fuente de verdad única** para datos compartidos. El nombre del negocio
   vive en `business.json` y en ningún otro lado.

2. **Coherencia de datos.** No puede haber discrepancias entre secciones
   porque los datos compartidos se resuelven en runtime desde un solo origen.

3. **Reactividad precisa.** Un cambio en `seo` de `business.json` no afecta
   al header, al footer ni al hero. Solo a quien lee `seo()`.

4. **Aislamiento de secciones.** Cada componente inyecta un solo service.
   El service puede cambiar internamente sin afectar al componente.

5. **Escalabilidad.** Agregar una sección nueva no requiere modificar
   archivos existentes. Solo crear su JSON, su service, y conectarlo.

6. **Testabilidad.** Cada service es independiente y se puede testear sin
   cargar otros services (excepto los entity services inyectados).

7. **Carga lazy.** Cada JSON se carga cuando su sección se renderiza por
   primera vez. No hay un bundle inicial de datos gigante.

8. **Simplicidad técnica.** Sin dependencias externas. Sin CMS. Sin backend.
   Sin WebSockets. Sin GraphQL. `fetch()` + `signal()`.

### Negativas

1. **Múltiples requests HTTP.** N secciones = N requests iniciales. Mitigado
   por HTTP/2 multiplexing y cache del browser. En la práctica, las secciones
   son ~10 y los JSONs son <1KB cada uno.

2. **Más código de composición.** Cada feature service que necesita datos
   compartidos tiene un `computed` que los une con sus datos locales. Es
   código repetitivo pero predecible.

3. **Coordinación entre capas.** Si un entity JSON cambia su estructura, los
   feature services que lo componen pueden romperse. Mitigado con tipos
   compartidos y tests.

4. **No hay editor visual.** El contenido se edita en archivos JSON. No es
   un problema para este proyecto (equipo técnico, contenido semi-estático),
   pero sería una limitación si el contenido lo editara un equipo no técnico.

### Compliance

Para asegurar que la arquitectura se mantiene en el tiempo:

1. **Code review:** Todo nuevo JSON de sección debe ser revisado para
   confirmar que no duplica campos de entity JSONs existentes.

2. **Linter (futuro):** Script que verifique que campos como `siteName`,
   `schedule`, `ctaLabel` no aparezcan en section JSONs.

3. **Arquitectura documentada:** Este ADR es el reference point. Cualquier
   desviación debe pasar por un nuevo ADR.

4. **Migración gradual:** Las secciones existentes que aún usan domain
   services directos se migran de a una al nuevo patrón, sin romper el
   funcionamiento actual.

---

## Referencias

- [Angular Signals Guide](https://angular.dev/guide/signals)
- [ADR-xxx: Signals como mecanismo de estado](docs/adr/xxx-signals-state.md)
- [Data Architecture doc](docs/data-architecture.md)
