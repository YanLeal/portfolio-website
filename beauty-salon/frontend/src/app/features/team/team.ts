import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { CardTiltDirective } from '../../shared/directives/card-tilt.directive';
import { TEAM } from '../../core/data/content';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [SectionHeader, SvgIcon, CardTiltDirective],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class TeamComponent {
  readonly team = TEAM;
}
