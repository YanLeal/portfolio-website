import { Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { WhatsappButtonComponent } from '../../shared/components/whatsapp-btn/whatsapp-btn';
import { ConfigService } from '../../core/services/config.service';

export interface HeroContent {
  readonly businessName: string;
  readonly tagline: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaSecondaryLabel: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgOptimizedImage, RevealDirective, WhatsappButtonComponent],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroComponent {
  private readonly configService = inject(ConfigService);

  readonly content = computed(() => {
    const cfg = this.configService.config();
    return cfg
      ? {
          businessName: cfg.site.name,
          tagline: cfg.sections.hero.tagline,
          description: cfg.sections.hero.description,
          ctaLabel: cfg.sections.hero.ctaLabel,
          ctaSecondaryLabel: cfg.sections.hero.ctaSecondaryLabel,
        }
      : { businessName: '', tagline: '', description: '', ctaLabel: '', ctaSecondaryLabel: '' };
  });

  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    const el = document.getElementById(fragment);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
