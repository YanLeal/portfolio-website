import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import type { Testimonial } from './testimonial.model';

@Injectable({ providedIn: 'root' })
export class TestimonialService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/testimonials/testimonials.json';

  readonly error = signal(false);

  private readonly allTestimonials$ = this.http
    .get<Testimonial[]>(this.jsonUrl)
    .pipe(
      shareReplay(1),
      catchError((err) => {
        console.error('[TestimonialService] Error al cargar testimonios:', err);
        this.error.set(true);
        return of([] as Testimonial[]);
      }),
    );

  getAll(): Observable<Testimonial[]> {
    return this.allTestimonials$;
  }
}
