import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
})
/**
 * Encabezado de sección con título y subtítulo opcional.
 *
 * Renderiza un `<header>` con `<h2>` para el título y un `<p>`
 * opcional para el subtítulo. Usado por todas las secciones del
 * sitio para mantener consistencia visual.
 *
 * @usage
 * ```html
 * <app-section-header title="Nuestros Servicios" subtitle="Todo para tu belleza" />
 * <app-section-header title="Contacto" />
 * ```
 */
export class SectionHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
