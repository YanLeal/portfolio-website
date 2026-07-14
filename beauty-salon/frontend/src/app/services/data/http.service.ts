import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, timer } from 'rxjs';
import { catchError, retry, shareReplay, timeout } from 'rxjs/operators';

const DEFAULT_TIMEOUT = 10_000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1_000;

export interface HttpOptions {
  readonly timeout?: number;
  readonly retries?: number;
  readonly label?: string;
}

@Injectable({ providedIn: 'root' })
export class HttpService {
  private readonly http = inject(HttpClient);

  get<T>(path: string, options?: HttpOptions): Observable<T> {
    const timeoutMs = options?.timeout ?? DEFAULT_TIMEOUT;
    const retries = options?.retries ?? MAX_RETRIES;
    const label = options?.label ?? path;

    return this.http.get<T>(path).pipe(
      timeout(timeoutMs),
      retry({
        count: retries,
        delay: (_err, attempt) => timer(attempt * RETRY_DELAY),
      }),
      shareReplay(1),
      catchError((err: HttpErrorResponse) => {
        console.error(`[HttpService] ${label}:`, err.status, err.message);
        return of(undefined as unknown as T);
      }),
    );
  }
}
