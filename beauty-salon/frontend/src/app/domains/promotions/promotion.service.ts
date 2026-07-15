import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { isPromocionVigente, type Promotion } from './promotion.model';

@Injectable({ providedIn: 'root' })
export class PromoService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/promotions/promotions.json';

  readonly error = signal(false);

  /** Fuente única: HTTP cacheado. */
  private readonly promo$ = this.http.get<Promotion[]>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[PromoService] Error al cargar promociones:', err);
      this.error.set(true);
      return of([]);
    }),
  );

  /** Bridge observable → signal para reactividad. */
  readonly #promos = toSignal(this.promo$, { initialValue: [] });

  /** Promociones vigentes: status='active', dentro del rango de fechas,
   *  ordenadas por prioridad descendente (mayor priority = primero). */
  readonly activePromotions = computed(() =>
    this.#promos()
      .filter((p) => isPromocionVigente(p))
      .sort((a, b) => b.priority - a.priority),
  );

  /** Promoción vigente con mayor prioridad, o null si no hay ninguna. */
  readonly currentPromotion = computed(() =>
    this.activePromotions()[0] ?? null,
  );

  /** Retorna la promoción activa más relevante, o null si no hay.
   *  Mantiene la interfaz Observable para compatibilidad. */
  getCurrent(): Observable<Promotion | null> {
    return this.promo$.pipe(
      map((promos) => {
        const active = promos
          .filter((p) => isPromocionVigente(p))
          .sort((a, b) => b.priority - a.priority);
        return active.length > 0 ? active[0] : null;
      }),
    );
  }
}
