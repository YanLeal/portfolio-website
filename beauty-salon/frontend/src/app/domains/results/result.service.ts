import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import type { Result } from './result.model';

@Injectable({ providedIn: 'root' })
export class ResultService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/results/before-after.json';

  readonly error = signal(false);

  private readonly allResults$ = this.http.get<Result[]>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[ResultService] Error al cargar resultados:', err);
      this.error.set(true);
      return of([] as Result[]);
    }),
  );

  /** Retorna todos los resultados ordenados por `order`. */
  getAll(): Observable<Result[]> {
    return this.allResults$.pipe(
      map((items) => [...items].sort((a, b) => a.order - b.order)),
    );
  }

  /** Retorna un resultado por su ID, o `undefined` si no existe. */
  getById(id: string): Observable<Result | undefined> {
    return this.allResults$.pipe(
      map((items) => items.find((r) => r.id === id)),
    );
  }

  /** Retorna solo los resultados destacados. */
  getFeatured(): Observable<Result[]> {
    return this.getAll().pipe(
      map((items) => items.filter((r) => r.featured)),
    );
  }

  /** Retorna resultados filtrados por categoría. */
  getByCategory(category: string): Observable<Result[]> {
    return this.getAll().pipe(
      map((items) => items.filter((r) => r.category === category)),
    );
  }
}
