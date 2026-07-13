import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { Testimonial } from '../models/testimonial.model';

/**
 * Raw shape from JSON — date viene como string ISO.
 * Se transforma a Testimonial (Date) en el pipe.
 */
interface RawTestimonial extends Omit<Testimonial, 'date'> {
  date: string;
}

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/testimonial.json';

  readonly error = signal(false);

  private readonly allTestimonials$ = this.http
    .get<RawTestimonial[]>(this.jsonUrl)
    .pipe(
      map((raw) =>
        raw.map((t) => ({ ...t, date: new Date(t.date) })),
      ),
      shareReplay(1),
      catchError((err) => {
        console.error('[TestimonialService] Error al cargar testimonios:', err);
        this.error.set(true);
        return of([]);
      }),
    );

  getAll(): Observable<Testimonial[]> {
    return this.allTestimonials$;
  }
}
