import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-service-option-card',
  standalone: true,
  templateUrl: './service-option-card.html',
  styleUrl: './service-option-card.css',
  host: {
    '[class.is-selected]': 'isSelected()',
    '[class.is-other]': 'other()',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
/**
 * Opción seleccionable de servicio en wizard de reserva.
 *
 * Renderiza un `<button>` con nombre, duración y precio.
 * Aplica clase `.is-selected` cuando está activo y `.is-other`
 * para la opción "Otro / No estoy segura".
 *
 * @usage
 * ```html
 * <app-service-option-card
 *   name="Corte + Brushing" duration="45 min" [price]="5500"
 *   [isSelected]="selectedId === 's1'" (select)="onSelect('s1')"
 * />
 * <app-service-option-card
 *   name="Otro" duration="Consulta general" [price]="0"
 *   [other]="true" (select)="onSelect('other')"
 * />
 * ```
 */
export class ServiceOptionCard {
  readonly name = input.required<string>();
  readonly duration = input.required<string>();
  readonly price = input.required<number>();
  readonly isSelected = input(false);
  readonly other = input(false);

  readonly select = output<void>();

  readonly ariaLabel = computed(() =>
    this.other() ? 'Seleccionar consulta general' : `Seleccionar servicio: ${this.name()}`,
  );
}
