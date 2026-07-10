import { Component } from '@angular/core';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [SvgIcon],
  host: { class: 'section-padding' },
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  scrollTo(event: Event, fragment: string): void {
    event.preventDefault();
    const el = document.getElementById(fragment);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }

  readonly stats = [
    { value: '10+', label: 'Años de experiencia' },
    { value: '5K+', label: 'Clientas satisfechas' },
    { value: '15+', label: 'Premios recibidos' },
  ];
}
