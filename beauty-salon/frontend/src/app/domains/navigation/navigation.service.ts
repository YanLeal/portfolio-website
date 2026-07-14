import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import type { NavItem } from './navigation.model';

export interface NavigationData {
  readonly nav: readonly NavItem[];
  readonly footerLinks: readonly NavItem[];
  readonly ctaReservar: string;
}

const FALLBACK_NAV: NavigationData = {
  nav: [],
  footerLinks: [],
  ctaReservar: '',
};

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private readonly http = inject(HttpClient);

  private readonly data$ = this.http
    .get<NavigationData>('assets/data/navigation/navigation.json')
    .pipe(
      shareReplay(1),
      catchError(() => {
        console.error('[NavigationService] Error loading navigation.json');
        return of(FALLBACK_NAV);
      }),
    );

  readonly data = toSignal(this.data$, { initialValue: FALLBACK_NAV });

  readonly nav = () => this.data().nav;
  readonly footerLinks = () => this.data().footerLinks;
  readonly ctaReservar = () => this.data().ctaReservar;
}
