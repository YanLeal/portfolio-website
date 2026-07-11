import { Component } from '@angular/core';
import { CtaButton } from '../../shared/components/cta-button/cta-button';
import { CTA_RESERVAR, SITE_NAME } from '../../core/data/content';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CtaButton],
  host: { class: 'section-padding' },
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  readonly siteName = SITE_NAME;
  readonly ctaReservar = CTA_RESERVAR;

  onCtaClick(): void {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }

  readonly stats = [
    { value: '10+', label: 'Años de experiencia' },
    { value: '5K+', label: 'Clientas satisfechas' },
    { value: '15+', label: 'Premios recibidos' },
  ];
}
