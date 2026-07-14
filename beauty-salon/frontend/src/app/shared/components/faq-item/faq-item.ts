import { Component, input, output } from '@angular/core';
import type { FaqItem } from '../../../domains/faq/faq.model';

@Component({
  selector: 'app-faq-item',
  standalone: true,
  imports: [],
  templateUrl: './faq-item.html',
  styleUrl: './faq-item.css',
})
export class FaqItemComponent {
  readonly faq = input.required<FaqItem>();
  readonly open = input(false);
  readonly toggle = output<void>();
}
