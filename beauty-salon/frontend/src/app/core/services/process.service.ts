import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { ProcessStep } from '../models/process-step.model';

@Injectable({ providedIn: 'root' })
export class ProcessService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/process.json';

  private readonly allSteps$ = this.http.get<ProcessStep[]>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[ProcessService] Error al cargar el proceso:', err);
      return of([]);
    }),
  );

  getAll(): Observable<ProcessStep[]> {
    return this.allSteps$;
  }
}
