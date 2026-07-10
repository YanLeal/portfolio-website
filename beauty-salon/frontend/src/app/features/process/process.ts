import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';

export interface ProcessStep {
  number: string;
  icon: 'search' | 'message-circle' | 'map-pin' | 'star';
  title: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [SectionHeader, SvgIcon],
  templateUrl: './process.html',
  styleUrl: './process.css',
})
export class ProcessComponent {
  readonly steps: ProcessStep[] = [
    {
      number: '01',
      icon: 'search',
      title: 'Elige tu servicio',
      description:
        'Elige entre cortes, color, manicuría, tratamientos y más.',
      image: 'images/process/proceso-01-800x600.webp',
    },
    {
      number: '02',
      icon: 'message-circle',
      title: 'Reserva tu turno',
      description:
        'Contáctanos por WhatsApp y reserva tu turno sin vueltas.',
      image: 'images/process/proceso-02-800x600.webp',
    },
    {
      number: '03',
      icon: 'map-pin',
      title: 'Visita el salón',
      description:
        'Te esperamos en Córdoba con un ambiente cálido y profesional.',
      image: 'images/process/proceso-03-800x600.webp',
    },
    {
      number: '04',
      icon: 'star',
      title: 'Sal radiante',
      description:
        'Disfruta el resultado y sal con tu look renovado.',
      image: 'images/process/proceso-04-800x600.webp',
    },
  ];
}
