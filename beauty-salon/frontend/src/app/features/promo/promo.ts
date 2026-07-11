import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { CtaButton } from '../../shared/components/cta-button/cta-button';
import { WHATSAPP_NUMBER } from '../../core/data/content';
import { PromoService } from '../../core/services/promo.service';
import type { Promotion } from '../../core/models/promotion.model';

const PLACEHOLDER_PROMO: Promotion = {
  month: '',
  discount: '',
  service: '',
  description: '',
  image: '',
  ctaLabel: 'Reservar',
  spotsLeft: 0,
  validUntil: '',
};

@Component({
  selector: 'app-promo',
  standalone: true,
  imports: [CtaButton],
  templateUrl: './promo.html',
  styleUrl: './promo.css',
})
export class PromoComponent {
  private readonly promoService = inject(PromoService);

  readonly promo = toSignal(
    this.promoService.getCurrent().pipe(filter(Boolean)),
    { initialValue: PLACEHOLDER_PROMO },
  );

  get whatsAppUrl(): string {
    const p = this.promo();
    const message = encodeURIComponent(
      `Hola, quiero reservar la Promoción de ${p.month}: ${p.service}. ¿Tienen turno disponible?`,
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
  }
}
