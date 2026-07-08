import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, WhatsappButtonComponent],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();

  readonly schedule = [
    { label: 'Lun – Vie', hours: '9:00 – 20:00' },
    { label: 'Sábado', hours: '9:00 – 18:00' },
    { label: 'Domingo', hours: 'Cerrado' },
  ];

  readonly contact = [
    { label: 'Dirección', value: 'Av. Siempre Viva 123, Córdoba' },
    { label: 'Teléfono', value: '+54 351 555-0123' },
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
