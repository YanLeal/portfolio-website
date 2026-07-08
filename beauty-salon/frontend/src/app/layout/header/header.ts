import { Component, DestroyRef, HostBinding, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavComponent } from '../nav/nav';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, NavComponent],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class HeaderComponent {
  readonly isMenuOpen = signal(false);
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
