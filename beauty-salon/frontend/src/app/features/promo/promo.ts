import { computed, Component, inject } from '@angular/core';
import { CtaButton, EmptyState, ErrorBoundary, Badge } from '../../shared';
import { PromoService } from '../../domains/promotions/promotion.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-promo',
  standalone: true,
  imports: [CtaButton, EmptyState, ErrorBoundary, Badge],
  templateUrl: './promo.html',
  styleUrl: './promo.css',
})
export class PromoComponent {
  private readonly promoService = inject(PromoService);
  private readonly contentService = inject(ContentService);
  readonly hasError = this.promoService.error;
  readonly currentPromotion = this.promoService.currentPromotion;
  readonly noPromotionsContent = computed(() => this.contentService.data().emptyState.noPromotions);

  /** Un item por vuelta: fuerza re-creación del DOM al cambiar de promo,
   *  lo que reproduce las animaciones CSS de entrada (fadeInUp, stagger). */
  readonly promoList = computed(() => {
    const p = this.currentPromotion();
    return p ? [p] : [];
  });
}
