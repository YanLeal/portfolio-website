import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-cta-button',
  standalone: true,
  templateUrl: './cta-button.html',
  styleUrl: './cta-button.css',
})
export class CtaButton {
  readonly label = input.required<string>();
  readonly variant = input<'primary' | 'secondary'>('primary');
  readonly clicked = output<void>();
}
