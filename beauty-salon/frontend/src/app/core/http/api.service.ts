import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { retry, timeout } from 'rxjs/operators';

const DEFAULT_TIMEOUT = 10_000;
const MAX_RETRIES = 2;
const RETRY_DELAY = 1_000;

export interface ApiOptions {
  readonly timeout?: number;
  readonly retries?: number;
  readonly label?: string;
}

/**
 * Servicio HTTP centralizado para toda la comunicación con fuentes de datos
 * (hoy JSON estático, mañana API REST).
 *
 * Responsabilidad ÚNICA: transportar datos desde una fuente remota hasta
 * el observable que el repository consume. NO maneja estado, NO transforma
 * datos, NO decide qué hacer con errores.
 *
 * Los errores se PROPAGAN (no se tragan) para que cada repositorio
 * decida cómo manejarlos (fallback, señal de error, reintento específico).
 *
 * ── Futuras extensiones (cuando llegue NestJS) ────────────────────
 *  • Base URL vía InjectionToken (entorno dev/prod)
 *  • Auth headers (Bearer token)
 *  • Interceptors para logging, transformación, caché
 *  • Refresh token en 401
 *
 * Cada extensión se agrega AQUÍ sin modificar ningún repository.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  /**
   * GET tipado con timeout + retry.
   *
   * @param path  Ruta del recurso. Cuando migremos a API, será relativa
   *              a la base URL (ej: '/services' → '/api/v1/services').
   * @param opciones  Timeout, reintentos y etiqueta para logging.
   *
   * @throws  HttpErrorResponse si la petición falla
   *          (timeout, red, 4xx/5xx).
   */
  get<T>(path: string, options?: ApiOptions): Observable<T> {
    const timeoutMs = options?.timeout ?? DEFAULT_TIMEOUT;
    const retries = options?.retries ?? MAX_RETRIES;
    const label = options?.label ?? path;

    // ── Futuro: anteponer baseUrl ───────────────────────────
    // const url = `${this.baseUrl}${path}`;
    // ────────────────────────────────────────────────────────

    return this.http.get<T>(path).pipe(
      timeout(timeoutMs),
      retry({
        count: retries,
        delay: (_err, attempt) => timer(attempt * RETRY_DELAY),
      }),
    );
  }
}
