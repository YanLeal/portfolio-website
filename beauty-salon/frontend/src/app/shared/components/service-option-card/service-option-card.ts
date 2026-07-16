import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-service-option-card',
  standalone: true,
  templateUrl: './service-option-card.html',
  styleUrl: './service-option-card.css',
  host: {
    '[class.is-selected]': 'isSelected()',
    '[class.is-subtle]': 'variant() === "subtle"',
  },
})
/**
 * Opción seleccionable para listados con nombre, duración y precio opcional.
 *
 * Renderiza un `<button>` con información estructurada.
 * La variante `subtle` usa borde punteado y fondo más claro,
 * ideal para opciones secundarias o "default".
 *
 * @usage
 * ```html
 * <app-service-option-card
 *   value="s1" name="Corte + Brushing"
 *   duration="45 min" priceLabel="$ 5.500"
 *   [isSelected]="selectedId === 's1'"
 *   (selected)="onSelected($event)"
 * />
 *
 * <app-service-option-card
 *   value="other" name="Otro"
 *   duration="—" variant="subtle"
 *   (selected)="onSelected($event)"
 * />
 * ```
 */
export class ServiceOptionCard {
  /** Identificador único que se emite al seleccionar. */
  readonly value = input.required<string>();

  /** Nombre visible de la opción. */
  readonly name = input.required<string>();

  /** Duración en formato texto (ej: "45 min", "—"). */
  readonly duration = input.required<string>();

  /** Precio opcional ya formateado (ej: "$ 5.500"). Si no se provee, no se muestra. */
  readonly priceLabel = input<string>();

  /** Marca visual de selección activa. */
  readonly isSelected = input(false);

  /** Variante visual: 'default' (sólido) | 'subtle' (punteado). */
  readonly variant = input<'default' | 'subtle'>('default');

  /** Emite `value` al hacer click. */
  readonly selected = output<string>();
}
