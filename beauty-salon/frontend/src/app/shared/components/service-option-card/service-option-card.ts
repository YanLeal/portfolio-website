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
