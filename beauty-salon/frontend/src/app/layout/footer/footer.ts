import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';
import { ConfigService } from '../../core/services/config.service';

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

  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    const el = document.getElementById(fragment);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/'], { fragment });
    }
  }

  private readonly configService = inject(ConfigService);

  readonly year = new Date().getFullYear();
  readonly siteName = computed(() => this.configService.config()?.site.name ?? '');

  readonly schedule = computed(() => this.configService.config()?.contact.schedule ?? []);

  readonly contact = computed(() => {
    const c = this.configService.config()?.contact;
    if (!c) return [];
    return [
      { label: 'Dirección', value: c.address },
      { label: 'Teléfono', value: c.phone.display },
      { label: 'Email', value: c.email },
    ];
  });

  readonly quickLinks = computed(() => this.configService.config()?.navigation.footerLinks ?? []);
}
