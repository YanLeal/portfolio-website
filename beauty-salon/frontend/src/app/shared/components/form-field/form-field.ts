import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  encapsulation: ViewEncapsulation.None,
})
export class FormFieldComponent {
  /** Texto del label. Si se omite, no se renderiza. */
  readonly label = input<string>();

  /** ID del input asociado (para el atributo for del label). */
  readonly labelFor = input<string>();

  /** Muestra un asterisco rojo junto al label. */
  readonly required = input(false);

  /** Muestra "(opcional)" junto al label. */
  readonly optional = input(false);

  /** Texto de error. Si es falsy, no se muestra. */
  readonly errorMessage = input<string | null>();

  /** Texto de ayuda adicional (siempre visible si se provee). */
  readonly hint = input<string>();
}
