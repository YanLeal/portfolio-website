import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import type { SiteConfig } from '../models/config.model';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private readonly http = inject(HttpClient);

  private readonly config$ = this.http.get<SiteConfig>('assets/data/config.json').pipe(
    shareReplay(1),
    catchError(() => {
      console.error('[ConfigService] Error loading config.json');
      return of(null);
    }),
  );

  readonly config = toSignal(this.config$, { initialValue: null });
}
