import { Component, input, output } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';
import { Card } from '../card/card';
import type { Service } from '../../../domains/services/service.model';

@Component({
  selector: 'app-service-card',
  standalone: true,
  imports: [SvgIcon, Card],
  host: { class: 'card-entrance' },
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
})
export class ServiceCard {
  readonly service = input.required<Service>();
  readonly book = output<string>();
}
