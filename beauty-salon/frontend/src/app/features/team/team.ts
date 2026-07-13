import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { CardTiltDirective } from '../../shared/directives/card-tilt.directive';
import { TeamService } from '../../core/services/team.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [SectionHeader, SvgIcon, CardTiltDirective],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class TeamComponent {
  private readonly teamService = inject(TeamService);
  private readonly configService = inject(ConfigService);
  readonly team = toSignal(this.teamService.getAll(), { initialValue: [] });
  readonly hasError = this.teamService.error;
  readonly teamTitle = computed(() => this.configService.config()?.sections.team.title ?? 'Equipo');
  readonly teamSubtitle = computed(() => this.configService.config()?.sections.team.subtitle ?? 'Los profesionales que te van a atender');
}
