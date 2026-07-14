import { Component, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RevealDirective } from '../../../shared/directives/reveal.directive';
import { WhatsappButtonComponent } from '../../../shared/components/whatsapp-btn/whatsapp-btn';
import { HeroService } from '../../../services/features/hero/hero.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [NgOptimizedImage, RevealDirective, WhatsappButtonComponent],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class HeroComponent {
  private readonly heroService = inject(HeroService);

  /** Signal directa desde HeroService — no necesita computed wrapper */
  readonly content = this.heroService.hero;

  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    const el = document.getElementById(fragment);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}
