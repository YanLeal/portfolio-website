import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  scrollToFragment(fragment: string): void {
    const el = document.getElementById(fragment);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
  }

  scrollTo(options: ScrollToOptions): void {
    window.scrollTo(options);
  }

  getScrollPosition(): { readonly x: number; readonly y: number } {
    return { x: window.scrollX, y: window.scrollY };
  }
}
