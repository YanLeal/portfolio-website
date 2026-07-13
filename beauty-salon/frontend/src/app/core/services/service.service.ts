import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Service, ServiceCategory } from '../models/service.model';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/services.json';

  readonly error = signal(false);

  /** Un único request HTTP cacheado con shareReplay.
   *  Todos los métodos públicos derivan de este observable base. */
  private readonly allServices$ = this.http.get<Service[]>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[ServiceService] Error al cargar servicios:', err);
      this.error.set(true);
      return of([]);
    }),
  );

  /** Retorna todos los servicios ordenados por sortOrder ascendente. */
  getAll(): Observable<Service[]> {
    return this.allServices$.pipe(
      map((services) => [...services].sort((a, b) => a.sortOrder - b.sortOrder)),
    );
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

  /** Retorna solo los servicios marcados como populares. */
  getPopular(): Observable<Service[]> {
    return this.getAll().pipe(
      map((services) => services.filter((s) => s.isPopular)),
    );
  }
}
