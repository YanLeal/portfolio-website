import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink],
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
