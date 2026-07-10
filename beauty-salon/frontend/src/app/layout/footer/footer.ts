import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, WhatsappButtonComponent],
  host: { class: 'block' },
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  private readonly router = inject(Router);

  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    const el = document.getElementById(fragment);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/'], { fragment });
    }
  }

  readonly year = new Date().getFullYear();

  readonly schedule = [
    { label: 'Lun – Vie', hours: '9:00 – 20:00' },
    { label: 'Sábado', hours: '9:00 – 18:00' },
    { label: 'Domingo', hours: 'Cerrado' },
  ];

  readonly contact = [
    { label: 'Dirección', value: 'Av. Siempre Viva 123, Córdoba' },
    { label: 'Teléfono', value: '+52 442 301 8772' },
    { label: 'Email', value: 'info@bellezaestilo.com' },
  ];

  readonly quickLinks = [
    { label: 'Servicios', fragment: 'servicios' },
    { label: 'Precios', fragment: 'precios' },
    { label: 'Galería', fragment: 'galeria' },
    { label: 'Equipo', fragment: 'equipo' },
    { label: 'Contacto', fragment: 'contacto' },
  ];
}
