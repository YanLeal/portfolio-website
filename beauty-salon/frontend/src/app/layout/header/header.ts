import { Component, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../../domains/navigation/nav';
import { HeaderService } from '../../services/features/header/header.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NavComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  private readonly headerService = inject(HeaderService);

  /** Signal directa desde HeaderService — siteName, labels, etc */
  readonly data = this.headerService.data;

  /** Estado local del menú mobile */
  readonly isMenuOpen = signal(false);

  /** Estado local de scroll */
  readonly isScrolled = signal(false);

  @HostBinding('class.transparent') get isTransparent(): boolean {
    return !this.isScrolled();
  }

  @HostBinding('class.solid') get isSolid(): boolean {
    return this.isScrolled();
  }

  private readonly SCROLL_THRESHOLD = 50;

  constructor() {
    const destroyRef = inject(DestroyRef);

    const onScroll = () => {
      this.isScrolled.set(window.scrollY > this.SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    destroyRef.onDestroy(() => window.removeEventListener('scroll', onScroll));
  }

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
