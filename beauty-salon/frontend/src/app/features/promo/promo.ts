import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { CtaButton } from '../../shared/components/cta-button/cta-button';
import { PromoService } from '../../domains/promotions/promotion.service';
import { BusinessService } from '../../domains/business/business.service';
import type { Promotion } from '../../domains/promotions/promotion.model';

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
  private readonly businessService = inject(BusinessService);
  readonly hasError = this.promoService.error;

  readonly promo = toSignal(
    this.promoService.getCurrent().pipe(filter(Boolean)),
    { initialValue: PLACEHOLDER_PROMO },
  );

  get whatsAppUrl(): string {
    const p = this.promo();
    const wa = this.businessService.data().contact.whatsapp;
    const message = encodeURIComponent(
      `Hola, quiero reservar la Promoción de ${p.month}: ${p.service}. ¿Tienen turno disponible?`,
    );
    return `https://wa.me/${wa}?text=${message}`;
  }
}
