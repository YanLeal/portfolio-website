import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WindowService {
  get viewport(): { readonly width: number; readonly height: number } {
    return { width: window.innerWidth, height: window.innerHeight };
  }

  get scrollY(): number {
    return window.scrollY;
  }

  get scrollX(): number {
    return window.scrollX;
  }

  get origin(): string {
    return window.location.origin;
  }
}
