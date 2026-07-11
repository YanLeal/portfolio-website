import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { CardTiltDirective } from '../../shared/directives/card-tilt.directive';
import { TeamService } from '../../core/services/team.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [SectionHeader, SvgIcon, CardTiltDirective],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class TeamComponent {
  private readonly teamService = inject(TeamService);
  readonly team = toSignal(this.teamService.getAll(), { initialValue: [] });
}
