import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-faq-item',
  standalone: true,
  imports: [],
  templateUrl: './faq-item.html',
  styleUrl: './faq-item.css',
})
/**
 * Elemento de acordeón FAQ con `<details>`/`<summary>` nativo.
 *
 * Recibe props planas (id, question, answer) en vez de un modelo
 * de dominio, manteniendo el componente puro y reutilizable.
 * Emite `toggle` para que el padre maneje qué item está abierto.
 *
 * @usage
 * ```html
 * <app-faq-item
 *   [id]="item.id"
 *   [question]="item.question"
 *   [answer]="item.answer"
 *   [open]="isOpen === item.id"
 *   (toggle)="toggleItem(item.id)"
 * />
 * ```
 */
export class FaqItemComponent {
  readonly id = input.required<string>();
  readonly question = input.required<string>();
  readonly answer = input.required<string>();
  readonly open = input(false);
  readonly toggle = output<void>();
}
