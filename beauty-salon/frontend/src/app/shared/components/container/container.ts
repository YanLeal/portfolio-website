import { Component, input } from '@angular/core';

@Component({
  selector: 'app-container',
  standalone: true,
  template: `
    <div
      class="mx-auto w-full px-4 md:px-6 lg:px-8"
      [class.max-w-content]="!narrow()"
      [class.max-w-[800px]]="narrow()"
    >
      <ng-content />
    </div>
  `,
})
/**
 * Contenedor de ancho máximo con padding responsive.
 *
 * Versión `narrow` (800px) para texto largo tipo artículo;
 * versión normal para layouts de sección estándar.
 * Usa clases utilitarias Tailwind para el layout.
 *
 * @usage
 * ```html
 * <app-container><p>Texto centrado con padding responsive</p></app-container>
 * <app-container [narrow]="true"><article>...</article></app-container>
 * ```
 */
export class ContainerComponent {
  readonly narrow = input(false);
}
