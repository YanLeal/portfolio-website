import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import type { Service } from './service.model';
import type { ServiceBadgeId, ServiceCategory } from './service.types';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/services/services.json';

  readonly error = signal(false);

  /** Un único request HTTP cacheado con shareReplay.
   *  Todos los métodos públicos derivan de este observable base. */
  private readonly allServices$ = this.http.get<Service[]>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[ServiceService] Error al cargar servicios:', err);
      this.error.set(true);
      return of([] as Service[]);
    }),
  );

  /** Ordena los badges de cada servicio por priority ascendente.
   *  Se aplica antes de exponer cualquier servicio al exterior. */
  #normalize(services: Service[]): Service[] {
    return services
      .map((s) => ({
        ...s,
        badges: s.badges
          ? ([...s.badges].sort((a, b) => a.priority - b.priority) as typeof s.badges)
          : s.badges,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /** Retorna todos los servicios ordenados por sortOrder ascendente
   *  y con badges ordenados por priority. */
  getAll(): Observable<Service[]> {
    return this.allServices$.pipe(map((services) => this.#normalize(services)));
  }

  /** Retorna un servicio por su ID, o undefined si no existe. */
  getById(id: string): Observable<Service | undefined> {
    return this.getAll().pipe(
      map((services) => services.find((s) => s.id === id)),
    );
  }

  /** Retorna los servicios filtrados por categoría. */
  getByCategory(category: ServiceCategory): Observable<Service[]> {
    return this.getAll().pipe(
      map((services) => services.filter((s) => s.category === category)),
    );
  }

  /** Retorna solo los servicios que tengan un badge del tipo indicado. */
  getByBadge(badgeId: ServiceBadgeId): Observable<Service[]> {
    return this.getAll().pipe(
      map((services) => services.filter((s) => s.badges?.some((b) => b.id === badgeId))),
    );
  }

  /** Retorna solo los servicios con badge 'popular'. */
  getPopular(): Observable<Service[]> {
    return this.getByBadge('popular');
  }
}
