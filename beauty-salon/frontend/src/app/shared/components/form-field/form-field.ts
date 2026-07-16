import { Component, input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  templateUrl: './form-field.html',
  styleUrl: './form-field.css',
  encapsulation: ViewEncapsulation.None,
})
/**
 * Campo de formulario con label, hint, y mensaje de error.
 *
 * Usa `ViewEncapsulation.None` para que los estilos del input
 * proyectado sean consistentes con el tema global. El slot
 * `<ng-content>` permite proyectar cualquier tipo de input,
 * select, textarea, etc.
 *
 * @usage
 * ```html
 * <app-form-field label="Nombre" [required]="true" labelFor="name"
 *   [errorMessage]="nameCtrl.invalid ? 'Campo requerido' : null">
 *   <input id="name" type="text" [(ngModel)]="name" required />
 * </app-form-field>
 *
 * <app-form-field label="Mensaje" [optional]="true" labelFor="notes">
 *   <textarea id="notes" [(ngModel)]="notes"></textarea>
 * </app-form-field>
 * ```
 */
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
