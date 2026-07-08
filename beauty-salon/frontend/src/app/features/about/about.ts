import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SectionHeader],
  templateUrl: './about.html',
})
export class AboutComponent {}
