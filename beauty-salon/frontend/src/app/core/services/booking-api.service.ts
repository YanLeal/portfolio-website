import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import type { BookingRequest, BookingResponse, BookingStatus } from '../models/booking.model';

// ─── Stub helper ────────────────────────────────────────
// Sacado a constante para que TS infiera BookingStatus
// en lugar de string. Reemplazar con http calls cuando
// el backend esté listo.

function stubResponse(
  id: string,
  status: BookingStatus,
  message: string,
): BookingResponse {
  return { id, status, message, createdAt: new Date().toISOString() };
}

/**
 * Servicio de API para turnos.
 *
 * ════════════════════════════════════════════════════
 *  STUB — Conectar cuando el backend esté listo
 * ════════════════════════════════════════════════════
 *
 * 1. Importar HttpClient en el constructor:
 *    constructor(private http: HttpClient) {}
 *
 * 2. Reemplazar cada método "of(...).pipe(delay(...))"
 *    con la llamada HTTP real, ej:
 *    return this.http.post<BookingResponse>('/api/bookings', request);
 *
 * 3. Ajustar las URL base desde environments/ si hace falta.
 */

@Injectable({ providedIn: 'root' })
export class BookingApiService {
  /**
   * Enviar un nuevo turno al backend.
   *
   * Real:
   *   return this.http.post<BookingResponse>('/api/bookings', request);
   */
  create(request: BookingRequest): Observable<BookingResponse> {
    console.warn('[BookingApiService] STUB — create() no conecta al backend', request);

    return of(
      stubResponse(
        `TURNO-${Date.now().toString(36).toUpperCase()}`,
        'pending',
        'Turno recibido. Te contactaremos por WhatsApp para confirmar.',
      ),
    ).pipe(delay(800));
  }

  /**
   * Obtener el estado de un turno existente.
   *
   * Real:
   *   return this.http.get<BookingResponse>(`/api/bookings/${id}`);
   */
  get(id: string): Observable<BookingResponse> {
    console.warn('[BookingApiService] STUB — get() no conecta al backend', { id });

    return of(
      stubResponse(id, 'pending', 'Estado del turno consultado correctamente.'),
    ).pipe(delay(400));
  }

  /**
   * Cancelar un turno existente.
   *
   * Real:
   *   return this.http.patch<BookingResponse>(`/api/bookings/${id}/cancel`, {});
   */
  cancel(id: string): Observable<BookingResponse> {
    console.warn('[BookingApiService] STUB — cancel() no conecta al backend', { id });

    return of(
      stubResponse(
        id,
        'cancelled',
        'Turno cancelado. Si necesitas reprogramar, escribinos por WhatsApp.',
      ),
    ).pipe(delay(400));
  }
}
