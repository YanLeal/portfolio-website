import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';
import { SITE_NAME, PHONE_DISPLAY, EMAIL, ADDRESS } from '../../core/data/content';

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
  readonly siteName = SITE_NAME;

  readonly schedule = [
    { label: 'Lun – Vie', hours: '9:00 – 20:00' },
    { label: 'Sábado', hours: '9:00 – 18:00' },
    { label: 'Domingo', hours: 'Cerrado' },
  ];

  readonly contact = [
    { label: 'Dirección', value: ADDRESS },
    { label: 'Teléfono', value: PHONE_DISPLAY },
    { label: 'Email', value: EMAIL },
  ];

  readonly quickLinks = [
    { label: 'Servicios', fragment: 'servicios' },
    { label: 'Precios', fragment: 'precios' },
    { label: 'Galería', fragment: 'galeria' },
    { label: 'Equipo', fragment: 'equipo' },
    { label: 'Contacto', fragment: 'contacto' },
  ];
}
