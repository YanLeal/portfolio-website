import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  templateUrl: './section-header.html',
  styleUrl: './section-header.css',
})
export class SectionHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
