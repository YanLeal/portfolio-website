import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { TEAM } from '../../core/data/content';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [SectionHeader],
  templateUrl: './team.html',
  styleUrl: './team.css',
})
export class TeamComponent {
  readonly team = TEAM;
}
