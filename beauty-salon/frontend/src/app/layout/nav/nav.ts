import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface NavItem {
  label: string;
  fragment: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class NavComponent {
  readonly isOpen = input(false);
  readonly isScrolled = input(false);
  readonly navigated = output<void>();

  readonly items: NavItem[] = [
    { label: 'Servicios', fragment: 'servicios' },
    { label: 'Precios', fragment: 'precios' },
    { label: 'Galería', fragment: 'galeria' },
    { label: 'Contacto', fragment: 'contacto' },
  ];

  close(): void {
    this.navigated.emit();
  }
}
