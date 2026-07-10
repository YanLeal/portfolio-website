import { Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';

export interface HeroContent {
  businessName: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  ctaSecondaryLabel: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, NgOptimizedImage, RevealDirective, WhatsappButtonComponent],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroComponent {
  readonly content = input<HeroContent>({
    businessName: 'Belleza & Estilo',
    tagline: 'Tu momento de brillar empieza acá',
    description:
      'Cuidado personal profesional en un ambiente pensado para vos. Cortes, color, manicuría, maquillaje y más.',
    ctaLabel: 'Reservá tu turno',
    ctaSecondaryLabel: 'Ver servicios',
  });
}
