# Guía de tamaños de imágenes — Belleza & Estilo

> Documento de trabajo para optimizar las imágenes del sitio sección por sección.
> No modificar imágenes sin consultar primero esta guía.

---

## Estado actual del proyecto

- **27 imágenes** en `public/images/`
- **~4.4 MB** total
- **5 imágenes** sin referencia en ningún template (probablemente restos de diseño)
- Varias imágenes con **aspect ratio incorrecto** vs. lo que espera el layout
- Varias imágenes **sobredimensionadas** para su uso real

---

## Cómo leer las tablas

| Columna | Significado |
|---|---|
| **Actual** | Dimensiones actuales del archivo en `public/images/` |
| **Muestra (template)** | `width` y `height` que declara el HTML |
| **Display** | Tamaño real que ocupa la imagen renderizada en pantalla |
| **Target** | Tamaño recomendado para exportar |
| **Target KB** | Peso máximo recomendado para WebP calidad 75 |

---

## 1. Hero — `hero.webp`

| | |
|---|---|
| **Uso** | Fondo full-viewport con `object-fit: cover` |
| **Actual** | 2752×1536 (135 KB) |
| **Muestra** | `width="1920" height="1080"` |
| **Display** | 100vw × 100dvh. En desktop ~1920×1080, en mobile se cropa verticalmente |
| **Target** | **1920×1080** (16:9) |
| **Target KB** | <100 KB |

### Notas

- 2752px de ancho es excesivo. El 95% de los visitantes tienen monitores de 1920px o menos. Los ultra-wide (>2560px) son <2% del tráfico para un salón local.
- Con `object-fit: cover` el excedente se recorta — no hay beneficio visual en tener más píxeles de los que entran en el viewport.
- La animación `heroZoom` escala la imagen a 106% — el extra de resolución se pierde en el zoom.
- La imagen tiene `priority` (LCP), así que el peso importa **directamente en la velocidad de carga**.

### Cómo exportarla

```
Formato: WebP
Tamaño: 1920×1080
Calidad: 75 (o 80 si tiene degradados finos)
Encuadre: Centrado, 16:9. La zona superior se ve más en mobile.
```

---

## 2. About — `beauty-salon-hero.webp`

| | |
|---|---|
| **Uso** | Imagen lateral en la sección "Sobre nosotros" |
| **Actual** | 2752×1536 (380 KB) |
| **Muestra** | `width="800" height="900"` |
| **Display** | Desktop: ~40–50vw (500–700px). Mobile: 100vw |
| **Target** | **1200×1350** (8:9) o recortar a 8:9 |
| **Target KB** | <100 KB |

### ⚠️ Problema de aspecto

El template espera una imagen vertical (8:9: alto > ancho). La imagen actual es apaisada (16:9). El browser la va a mostrar distorsionada o el layout se va a comportar inesperadamente.

**Soluciones:**

| Opción | Cambio necesario |
|---|---|
| **A (recomendada)** | Recortar la imagen a 1200×1350 (vertical, 8:9) y mantener el template como está |
| **B** | Cambiar template a `width="800" height="450"` y ajustar el CSS si es necesario |

### Cómo exportarla (opción A)

```
Formato: WebP
Tamaño: 1200×1350
Calidad: 75
Encuadre: Centrado vertical, que el sujeto principal entre completo
Nota: 1200px cubre retina para el display de ~600px de ancho
```

---

## 3. Booking CTA — `recepcion-del-salon.webp`

| | |
|---|---|
| **Uso** | Fondo de la sección "Reservá tu turno" con overlay oscuro |
| **Actual** | 2048×1152 (144 KB) |
| **Muestra** | `width="1400" height="600"` |
| **Display** | 100vw de ancho × 380–400px de alto |
| **Target** | **1400×600** (7:3) |
| **Target KB** | <80 KB |

### Notas

- El template ya declara 1400×600. Exportar a ese tamaño exacto evita que el browser tenga que redimensionar.
- La sección solo mide 380–400px de alto. Con 600px de alto en la fuente hay más resolución de la necesaria, pero el `object-fit: cover` cropa el sobrante.
- Tiene overlay oscuro (`rgba(24, 20, 16, 0.88)`). Se puede bajar la calidad a 70 porque el degradé tapa detalles finos.

### Cómo exportarla

```
Formato: WebP
Tamaño: 1400×600
Calidad: 70 (el overlay oscuro esconde imperfecciones)
Encuadre: Centrado horizontal. La zona central es la que se ve siempre.
```

---

## 4. Service cards (6 imágenes)

| Archivo | Actual | KB | Target | Target KB |
|---|---|---|---|---|
| `corte-de-cabello.webp` | 2400×1792 | 191 KB | 1200×900 | <80 KB |
| `coloracion.webp` | 2400×1792 | **294 KB** | 1200×900 | <80 KB |
| `manicuria.webp` | 2400×1792 | 118 KB | 1200×900 | <80 KB |
| `pedicuria.webp` | 2400×1792 | 218 KB | 1200×900 | <80 KB |
| `maquillaje-profesional.webp` | 2400×1792 | 196 KB | 1200×900 | <80 KB |
| `tratamiento-facial.webp` | 2400×1792 | 127 KB | 1200×900 | <80 KB |

| | |
|---|---|
| **Uso** | Card con `aspect-ratio: 4/3` |
| **Actual** | 2400×1792 (~4:3 ✓) |
| **Muestra** | `width="800" height="600"` |
| **Display** | Desktop (3 cols): ~300–380px. Tablet (2 cols): ~400–500px. Mobile (1 col): 100vw |
| **Target** | **1200×900** (4:3) |
| **Target KB** | <80 KB cada una |

### Notas

- El aspecto 4:3 es correcto en todas. No tocar el crop.
- 2400px es excesivo para un display de ~380px de ancho. Con 1200px cubrís retina (3×).
- `coloracion.webp` a 294 KB es la más pesada — se puede reducir ~70%.

### Cómo exportarlas

```
Formato: WebP
Tamaño: 1200×900
Calidad: 75
Encuadre: Centrado, mantener el 4:3 actual
Nota: todas usan loading="lazy", el peso importa menos que hero pero suma (son 6)
```

---

## 5. Testimonial cards (3 imágenes)

| Archivo | Actual | KB | Target | Target KB |
|---|---|---|---|---|
| `clienta-satisfecha-saliendo.webp` | 1600×1600 | 152 KB | 800×600 | <60 KB |
| `tu-momento-de-brillar.webp` | 2048×1152 | 94 KB | 800×600 | <60 KB |
| `reserva-tu-turno.webp` | 2048×1152 | 104 KB | 800×600 | <60 KB |

| | |
|---|---|
| **Uso** | Card background (`aspect-ratio: 4/3`) + avatar de 44×44px |
| **Muestra** | `width="400" height="300"` (card) + `width="44" height="44"` (avatar) |
| **Display** | Card: ~300–380px de ancho. Avatar: 44px |
| **Target** | **800×600** (4:3) |
| **Target KB** | <60 KB cada una |

### ⚠️ Problema con `clienta-satisfecha-saliendo.webp`

Es cuadrada (1600×1600) pero el contenedor espera 4:3. Con `object-fit: cover` se va a crop verticalmente. Si la composición tiene el sujeto centrado, funciona. Si no, recortar a 4:3.

### Nota sobre el avatar

La misma imagen se usa para avatar de 44×44px. Estás descargando 150 KB para mostrar un círculo de 44px. Opciones:

1. **No hacer nada** — el browser cachea la imagen después del primer load. El avatar se ve bien con `object-fit: cover`.
2. **Separar avatar** — agregar un thumbnail de 88×88px (retina) como archivo aparte si querés eficiencia máxima.

Para un proyecto de este tamaño, la opción 1 es suficiente.

### Cómo exportarlas

```
Formato: WebP
Tamaño: 800×600 (4:3). Si la imagen original no es 4:3, recortar centrado.
Calidad: 75
Encuadre: Que el sujeto principal quede en el centro del 4:3.
  El avatar de 44px va a cropear el centro de la imagen.
```

---

## 6. Team photos (3 imágenes)

| Archivo | Actual | KB | Target | Target KB |
|---|---|---|---|---|
| `sofia-romero-directora.webp` | 1408×1760 | 71 KB | 800×800 | <60 KB |
| `valentina-lopez-maquilladora.webp` | 1408×1760 | 99 KB | 800×800 | <60 KB |
| `camila-torres-manicurista.webp` | 1408×1760 | 90 KB | 800×800 | <60 KB |

| | |
|---|---|
| **Uso** | Card con `aspect-ratio: 1` (cuadrado) |
| **Muestra** | `width="400" height="400"` |
| **Display** | Desktop (3 cols): ~300–380px. Mobile (1 col): ~100vw |
| **Target** | **800×800** (1:1) |
| **Target KB** | <60 KB cada una |

### ⚠️ Problema de aspecto

Las imágenes son 1408×1760 (4:5, vertical/retrato). El diseño espera 1:1 (cuadrado). Con `object-fit: cover` se pierde ~20% de cada lado.

**Soluciones:**

| Opción | Cambio necesario |
|---|---|
| **A (recomendada)** | Recortar a 800×800 centrando el rostro. El diseño está hecho para cards cuadradas |
| **B** | Cambiar a `aspect-ratio: 4/5` en el CSS y mantener las imágenes como están |

### Cómo exportarlas (opción A)

```
Formato: WebP
Tamaño: 800×800 (cuadrado)
Calidad: 75
Encuadre: Rostro centrado en el cuadrado, dejar un margen pequeño arriba.
  El card overlay con las redes sociales se superpone en la parte inferior,
  asegurate de que el rostro quede en los 2/3 superiores del cuadrado.
```

---

## 7. Gallery (8 imágenes en masonry)

| Archivo | Actual | KB | Target | Target KB |
|---|---|---|---|---|
| `resultado-corte-de-cabello.webp` | 1792×1792 | 192 KB | 1200×1200 | <100 KB |
| `resultado-coloracion.webp` | 1792×1792 | **311 KB** | 1200×1200 | <100 KB |
| `detalle-de-nail-art-creativo.webp` | 2048×2048 | 144 KB | 1200×1200 | <100 KB |
| `maquillaje-finalizado.webp` | 1600×1600 | 80 KB | 1200×1200 | ya está bien |
| `resultado-manicuria.webp` | 1792×1792 | 118 KB | 1200×1200 | <100 KB |
| `momento-de-cuidado.webp` | 1600×1600 | 84 KB | 1200×1200 | ya está bien |
| `equipo-trabajando.webp` | 1792×1792 | 171 KB | 1200×1200 | <100 KB |
| `transformacion-antes-despues.webp` | 2048×2048 | **255 KB** | 1200×1200 | <100 KB |

| | |
|---|---|
| **Uso** | Masonry con CSS columns. Cada imagen conserva su altura natural |
| **Actual** | 1600²–2048² |
| **Muestra** | `width="800"` (solo ancho, altura automática) |
| **Display** | Mobile (2 cols): ~180px. Tablet (3 cols): ~220px. Desktop (4 cols): ~280px |
| **Target** | **1200×1200** máximo (o mantener si ya es menor) |
| **Target KB** | <100 KB cada una |

### Notas

- En masonry la altura natural de cada imagen importa para el layout. Si cambiás el tamaño, mantené el aspect ratio original de cada foto.
- Las imágenes cuadradas o casi cuadradas funcionan mejor en el masonry de 4 columnas.
- `resultado-coloracion.webp` (311 KB) y `transformacion-antes-despues.webp` (255 KB) son las más pesadas — priorizarlas.

### Cómo exportarlas

```
Formato: WebP
Tamaño: 1200px en el lado más largo (el otro lado se ajusta automáticamente)
  Si la imagen original es 1792×1792 → exportar a 1200×1200
  Si la imagen original es 1600×1600 → se puede dejar o reducir a 1200×1200
Calidad: 75
Encuadre: No recortar, mantener el aspect ratio original.
  El masonry respeta la altura natural de cada foto.
```

---

## 8. Imágenes sin referencia (5 archivos)

| Archivo | Actual | KB | Decisión |
|---|---|---|---|
| `collage-ambiental.webp` | 2048×1152 | 129 KB | ❓ No se usa |
| `detalle-de-productos.webp` | 1600×1600 | 119 KB | ❓ No se usa |
| `historia-y-pasion.webp` | 1408×1760 | 154 KB | ❓ No se usa |
| `el-equipo-en-accion-colaborativa.webp` | 1296×1616 | 149 KB | ❓ No se usa |
| `calendario-turnos.webp` | 2048×1152 | 97 KB | ❓ No se usa |

**Acumulado: ~650 KB** que nadie descarga porque ninguna template las referencia.

### Recomendación

1. Decidir si se integran en una sección existente o futura.
2. Si no, eliminarlas de `public/images/` para reducir el build.
3. Si se integran, dimensionar según la sección de destino.

---

## Tabla general de target

| Sección | Imagen(es) | Target | Aspecto | KB máx |
|---|---|---|---|---|
| Hero | `hero.webp` | 1920×1080 | 16:9 | 100 KB |
| About | `beauty-salon-hero.webp` | 1200×1350 | 8:9 | 100 KB |
| Booking CTA | `recepcion-del-salon.webp` | 1400×600 | 7:3 | 80 KB |
| Service cards | 6 imágenes | 1200×900 | 4:3 | 80 KB c/u |
| Testimonials | 3 imágenes | 800×600 | 4:3 | 60 KB c/u |
| Team | 3 imágenes | 800×800 | 1:1 | 60 KB c/u |
| Gallery | 8 imágenes | 1200 (lado mayor) | original | 100 KB c/u |
| Huérfanas | 5 imágenes | — | — | decidir si eliminar |

---

## Checklist por sección

### Hero
- [ ] Exportar `hero.webp` a 1920×1080
- [ ] Mantener 16:9
- [ ] Verificar que el encuadre funcione en mobile (zona superior visible)

### About
- [ ] Decidir opción A (recortar a vertical) o B (cambiar template)
- [ ] Si opción A: exportar `beauty-salon-hero.webp` a 1200×1350
- [ ] Si opción A: verificar que el sujeto principal entre completo

### Booking CTA
- [ ] Exportar `recepcion-del-salon.webp` a 1400×600
- [ ] Se puede bajar calidad a 70 (overlay oscuro)

### Service cards
- [ ] Exportar las 6 imágenes a 1200×900
- [ ] Verificar encuadre 4:3 en cada una
- [ ] Priorizar `coloracion.webp` (la más pesada: 294 KB → <80 KB)

### Testimonials
- [ ] Exportar 3 imágenes a 800×600 (4:3)
- [ ] `clienta-satisfecha-saliendo.webp`: recortar de cuadrada a 4:3

### Team
- [ ] Decidir opción A (recortar a cuadrado) o B (cambiar CSS)
- [ ] Si opción A: exportar 3 fotos a 800×800 centrando rostro
- [ ] Verificar que el rostro quede en 2/3 superiores (el overlay de redes sociales está abajo)

### Gallery
- [ ] Reducir `resultado-coloracion.webp` de 1792² a 1200² (311 KB → <100 KB)
- [ ] Reducir `transformacion-antes-despues.webp` de 2048² a 1200² (255 KB → <100 KB)
- [ ] Revisar las demás (varias ya están bien)
- [ ] Mantener aspect ratio original de cada imagen

### Huérfanas
- [ ] Decidir: integrar en una sección o eliminar archivos
- [ ] Si eliminar: borrar los 5 archivos de `public/images/`

---

## Reglas generales

1. **Nunca más grande que 2× el display.** Una imagen que se muestra a 400px → 800px de fuente es suficiente para retina. Más allá es peso al pedo.

2. **El aspect ratio del template tiene que matchear el de la imagen.** Si el HTML dice `width="800" height="900"`, la imagen TIENE que ser 8:9. Si no, el layout se rompe.

3. **WebP calidad 75** para todo. Es calidad indistinguible del original y pesa 60–80% menos que JPEG.

4. **Exportar siempre al tamaño exacto de uso.** El browser no debería tener que redimensionar. Especialmente importante para las service cards (1200×900 exacto).

5. **Después de cambiar tamaños, verificar visualmente** que el encuadre sigue funcionando en mobile y desktop. Un crop automático puede cortar lo que no debe.
