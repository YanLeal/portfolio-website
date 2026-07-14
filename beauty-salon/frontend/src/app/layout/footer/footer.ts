import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';
import { FooterService } from '../../services/features/footer/footer.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, WhatsappButtonComponent],
  host: { class: 'block' },
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  private readonly router = inject(Router);
  private readonly footerService = inject(FooterService);

  /** Signal directa desde FooterService */
  readonly data = this.footerService.data;

  /** Año actual — se calcula una vez, no cambia durante la sesión */
  readonly year = this.footerService.year;

  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    const el = document.getElementById(fragment);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/'], { fragment });
    }
  }
}
