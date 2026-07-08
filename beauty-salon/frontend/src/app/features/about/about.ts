import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, SvgIcon],
  host: { class: 'section-padding' },
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  readonly stats = [
    { value: '10+', label: 'Años de experiencia' },
    { value: '5K+', label: 'Clientas satisfechas' },
    { value: '15+', label: 'Premios recibidos' },
  ];
}
