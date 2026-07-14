import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import type { ProcessStep } from './process.model';

@Injectable({ providedIn: 'root' })
export class ProcessService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/process/process.json';

  readonly error = signal(false);

  private readonly allSteps$ = this.http.get<ProcessStep[]>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[ProcessService] Error al cargar el proceso:', err);
      this.error.set(true);
      return of([] as ProcessStep[]);
    }),
  );

  getAll(): Observable<ProcessStep[]> {
    return this.allSteps$;
  }
}
