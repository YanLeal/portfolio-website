import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorBoundary } from '../../shared/components/error-boundary/error-boundary';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { CardTiltDirective } from '../../shared/directives/card-tilt.directive';
import { TeamService } from '../../domains/team/team.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [ErrorBoundary, SectionHeader, SvgIcon, CardTiltDirective],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class TeamComponent {
  private readonly teamService = inject(TeamService);
  private readonly contentService = inject(ContentService);
  readonly team = toSignal(this.teamService.getAll(), { initialValue: [] });
  readonly hasError = this.teamService.error;
  readonly teamTitle = computed(() => this.contentService.data().team.title);
  readonly teamSubtitle = computed(() => this.contentService.data().team.subtitle);
}
