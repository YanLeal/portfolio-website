import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  template: `<p class="section-error">{{ message() }}</p>`,
})
/**
 * Mensaje de error contextual para secciones con carga de datos.
 *
 * Renderiza un párrafo con la clase global `.section-error`.
 * Reemplaza los `<p class="section-error">` inline en las features
 * para mantener consistencia visual y permitir cambios centralizados.
 *
 * @usage
 * ```html
 * @if (hasError()) {
 *   <app-error-boundary message="No pudimos cargar los datos. Actualiza la página." />
 * }
 * ```
 */
export class ErrorBoundary {
  /** Mensaje de error a mostrar. */
  readonly message = input.required<string>();
}
