import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { Promotion } from '../models/promotion.model';

@Injectable({ providedIn: 'root' })
export class PromoService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/promotions.json';

  readonly error = signal(false);

  /** promotion.json es un objeto único, no un array. */
  private readonly promo$ = this.http.get<Promotion>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[PromoService] Error al cargar la promoción:', err);
      this.error.set(true);
      return of(null);
    }),
  );

  /** Retorna la promoción activa actual, o null si no hay/no se pudo cargar. */
  getCurrent(): Observable<Promotion | null> {
    return this.promo$;
  }
}
