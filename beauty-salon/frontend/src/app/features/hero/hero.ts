import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

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
  imports: [RouterLink],
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

  readonly ctaClicked = output<void>();

  onCtaClick(): void {
    this.ctaClicked.emit();
  }
}
