import { Component } from '@angular/core';

export interface PromoData {
  month: string;
  discount: string;
  service: string;
  description: string;
  image: string;
  ctaLabel: string;
  spotsLeft: number;
  validUntil: string;
}

const WHATSAPP_NUMBER = '524423016543';

@Component({
  selector: 'app-promo',
  standalone: true,
  imports: [],
  templateUrl: './promo.html',
  styleUrl: './promo.css',
})
export class PromoComponent {
  readonly promo: PromoData = {
    month: 'Julio',
    discount: '20% OFF',
    service: 'Corte + Color completo',
    description:
      'Lavado con productos premium, corte personalizado y coloración completa en nuestro salón.',
    image: 'images/promo/promo-julio-800x1067.webp',
    ctaLabel: 'Reservar promoción',
    spotsLeft: 5,
    validUntil: '31/7/26',
  };

  get whatsAppUrl(): string {
    const message = encodeURIComponent(
      `Hola, quiero reservar la Promoción de ${this.promo.month}: ${this.promo.service}. ¿Tienen turno disponible?`,
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  }
}
