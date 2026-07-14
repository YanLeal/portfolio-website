import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import type { BusinessConfig } from './business.model';

const FALLBACK: BusinessConfig = {
  site: { name: '', url: '', description: '', logo: '' },
  contact: {
    phone: { display: '', tel: '' },
    whatsapp: '',
    email: '',
    address: '',
    social: { instagram: '', facebook: '' },
    schedule: [],
  },
  seo: {
    title: '',
    description: '',
    ogImage: '',
    ogLocale: 'es_AR',
    canonical: '',
  },
};

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly http = inject(HttpClient);

  private readonly data$ = this.http
    .get<BusinessConfig>('assets/data/business/business.json')
    .pipe(
      shareReplay(1),
      catchError(() => {
        console.error('[BusinessService] Error loading business.json');
        return of(FALLBACK);
      }),
    );

  readonly data = toSignal(this.data$, { initialValue: FALLBACK });
}
