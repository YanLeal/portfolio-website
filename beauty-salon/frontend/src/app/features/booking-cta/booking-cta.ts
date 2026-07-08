import { Component } from '@angular/core';
import { CtaButton } from '../../shared/components/cta-button/cta-button';

@Component({
  selector: 'app-booking-cta',
  standalone: true,
  imports: [CtaButton],
  templateUrl: './booking-cta.html',
})
export class BookingCtaComponent {
  onBook(): void {
    // TODO: open booking modal or navigate to booking page
  }
}
