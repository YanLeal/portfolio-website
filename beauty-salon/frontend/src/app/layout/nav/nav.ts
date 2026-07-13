import { Component, computed, ElementRef, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '../../core/services/config.service';

export interface NavItem {
  label: string;
  fragment: string;
}

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class NavComponent {
  private readonly router = inject(Router);
  private readonly el = inject(ElementRef);

  private readonly configService = inject(ConfigService);

  readonly isOpen = input(false);
  readonly isScrolled = input(false);
  readonly navigated = output<void>();
  readonly ctaReservar = computed(() => this.configService.config()?.shared.ctaReservar ?? '');

  readonly items = computed(() => this.configService.config()?.navigation.nav ?? []);

  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    this.close();

    const el = document.getElementById(fragment);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Si no está en el DOM (ej: desde 404), navegá al home con fragment
      this.router.navigate(['/'], { fragment });
    }
  }

  close(): void {
    this.navigated.emit();
  }

  /** Traps Tab focus within the mobile panel when open */
  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;

    const panel = this.el.nativeElement.querySelector('.panel') as HTMLElement | null;
    if (!panel) return;

    const focusable: HTMLElement[] = Array.from(
      panel.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => (el as HTMLElement).offsetParent !== null) as HTMLElement[];

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
