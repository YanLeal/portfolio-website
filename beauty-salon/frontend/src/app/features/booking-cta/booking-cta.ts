import { Component } from '@angular/core';
import { CtaButton } from '../../shared';

@Component({
  selector: 'app-booking-cta',
  standalone: true,
  imports: [CtaButton],
  templateUrl: './booking-cta.html',
  styleUrl: './booking-cta.css',
})
export class BookingCtaComponent {
  onBook(): void {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
