import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

export interface NavItem {
  label: string;
  fragment: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class NavComponent {
  private readonly router = inject(Router);

  readonly isOpen = input(false);
  readonly isScrolled = input(false);
  readonly navigated = output<void>();

  readonly items: NavItem[] = [
    { label: 'Servicios', fragment: 'servicios' },
    { label: 'Precios', fragment: 'precios' },
    { label: 'Galería', fragment: 'galeria' },
    { label: 'Contacto', fragment: 'contacto' },
  ];

  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    this.close();

    const el = document.getElementById(fragment);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Si no está en el DOM (ej: desde 404), navegá al home con fragment
      this.router.navigate(['/'], { fragment });
    }
  }

  close(): void {
    this.navigated.emit();
  }
}
