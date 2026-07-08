import { Component, input, output } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [SvgIcon],
  host: { class: 'card-entrance' },
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
})
export class ServiceCard {
  readonly service = input.required<Service>();
  readonly book = output<string>();
}
