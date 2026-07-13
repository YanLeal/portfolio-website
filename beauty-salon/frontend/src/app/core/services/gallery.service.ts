import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { GalleryItem } from '../models/gallery-item.model';

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/gallery.json';

  readonly error = signal(false);

  private readonly allImages$ = this.http.get<GalleryItem[]>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[GalleryService] Error al cargar la galería:', err);
      this.error.set(true);
      return of([]);
    }),
  );

  getAll(): Observable<GalleryItem[]> {
    return this.allImages$;
  }

  getByCategory(category: string): Observable<GalleryItem[]> {
    return this.allImages$.pipe(
      map((items) => items.filter((i) => i.category === category)),
    );
  }
}
