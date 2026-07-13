import { Component, computed, inject } from '@angular/core';
import { CtaButton } from '../../shared/components/cta-button/cta-button';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CtaButton],
  host: { class: 'section-padding' },
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  private readonly configService = inject(ConfigService);

  readonly siteName = computed(() => this.configService.config()?.site.name ?? '');
  readonly ctaReservar = computed(() => this.configService.config()?.shared.ctaReservar ?? '');

  readonly stats = computed(() => this.configService.config()?.sections.about.stats ?? []);

  onCtaClick(): void {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
