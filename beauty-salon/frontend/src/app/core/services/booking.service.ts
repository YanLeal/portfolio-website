import { Injectable } from '@angular/core';
import { BookingApiService } from './booking-api.service';
import type { BookingRequest } from '../models/booking.model';

/**
 * Fachada de alto nivel para operaciones de turnos.
 *
 * Los componentes del frontend NO usan BookingApiService directamente;
 * usan BookingService. Cuando el backend esté listo, BookingService
 * delega a BookingApiService y el frontend no se entera del cambio.
 */

@Injectable({ providedIn: 'root' })
export class BookingService {
  constructor(private api: BookingApiService) {}

  /** Enviar un turno al backend (stub hasta conectar API) */
  submit(request: BookingRequest) {
    return this.api.create(request);
  }

  /** Consultar estado de un turno */
  getStatus(bookingId: string) {
    return this.api.get(bookingId);
  }

  /** Cancelar un turno */
  cancel(bookingId: string) {
    return this.api.cancel(bookingId);
  }
}
