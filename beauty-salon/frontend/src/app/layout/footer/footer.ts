import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WhatsappButton } from '../../shared';
import { FooterService } from '../../services/features/footer/footer.service';
import { BusinessService } from '../../domains/business/business.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, WhatsappButton],
  host: { class: 'block' },
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class FooterComponent {
  private readonly router = inject(Router);
  private readonly footerService = inject(FooterService);
  private readonly businessService = inject(BusinessService);

  /** Signal directa desde FooterService */
  readonly data = this.footerService.data;

  /** Horarios desde BusinessService — fuente única de verdad. */
  readonly businessHours = this.businessService.businessHours;
  readonly isOpenNow = this.businessService.isOpenNow;

  /** WhatsApp phone from BusinessService */
  readonly waPhone = computed(() => this.businessService.data().contact.whatsapp);

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
