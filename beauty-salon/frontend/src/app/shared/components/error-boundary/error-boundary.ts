import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-boundary',
  standalone: true,
  template: `<p class="section-error">{{ message() }}</p>`,
})
export class ErrorBoundary {
  /** Mensaje de error a mostrar. */
  readonly message = input.required<string>();
}
