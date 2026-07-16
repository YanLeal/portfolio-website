import { computed, Component, inject } from '@angular/core';
import { CtaButton } from '../../shared/components/cta-button/cta-button';
import { ErrorBoundary } from '../../shared/components/error-boundary/error-boundary';
import { PromoService } from '../../domains/promotions/promotion.service';

@Component({
  selector: 'app-promo',
  standalone: true,
  imports: [CtaButton, ErrorBoundary],
  templateUrl: './promo.html',
  styleUrl: './promo.css',
})
export class PromoComponent {
  private readonly promoService = inject(PromoService);
  readonly hasError = this.promoService.error;
  readonly currentPromotion = this.promoService.currentPromotion;

  /** Un item por vuelta: fuerza re-creación del DOM al cambiar de promo,
   *  lo que reproduce las animaciones CSS de entrada (fadeInUp, stagger). */
  readonly promoList = computed(() => {
    const p = this.currentPromotion();
    return p ? [p] : [];
  });
}
