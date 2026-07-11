import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { TeamMember } from '../models/team-member.model';

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);
  private readonly jsonUrl = 'assets/data/team.json';

  private readonly allMembers$ = this.http.get<TeamMember[]>(this.jsonUrl).pipe(
    shareReplay(1),
    catchError((err) => {
      console.error('[TeamService] Error al cargar el equipo:', err);
      return of([]);
    }),
  );

  getAll(): Observable<TeamMember[]> {
    return this.allMembers$;
  }

  getById(id: string): Observable<TeamMember | undefined> {
    return this.allMembers$.pipe(
      map((members) => members.find((m) => m.id === id)),
    );
  }
}
