import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { CtaButton } from '../../shared/components/cta-button/cta-button';
import { PromoService } from '../../core/services/promo.service';
import { ConfigService } from '../../core/services/config.service';
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
  private readonly configService = inject(ConfigService);
  readonly hasError = this.promoService.error;

  readonly promo = toSignal(
    this.promoService.getCurrent().pipe(filter(Boolean)),
    { initialValue: PLACEHOLDER_PROMO },
  );

  get whatsAppUrl(): string {
    const p = this.promo();
    const wa = this.configService.config()?.contact.whatsapp ?? '5214423016543';
    const message = encodeURIComponent(
      `Hola, quiero reservar la Promoción de ${p.month}: ${p.service}. ¿Tienen turno disponible?`,
    );
    return `https://wa.me/${wa}?text=${message}`;
  }
}
