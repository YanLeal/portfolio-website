import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import type { ContactConfig } from './contact.model';

const FALLBACK: ContactConfig = {
  title: 'Reserva tu cita',
  subtitle: 'Elige el servicio, el día y el horario',
  wizardSteps: ['Servicio', 'Fecha', 'Datos', 'Confirmar'],
  timeSlots: {
    morning: ['09:00', '10:00', '11:00'],
    afternoon: ['14:00', '15:00', '16:00', '17:00'],
  },
};

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly http = inject(HttpClient);

  private readonly config$ = this.http
    .get<ContactConfig>('assets/data/contact/contact.json')
    .pipe(
      shareReplay(1),
      catchError(() => {
        console.error('[ContactService] Error loading contact.json');
        return of(FALLBACK);
      }),
    );

  readonly config = toSignal(this.config$, { initialValue: FALLBACK });
}
