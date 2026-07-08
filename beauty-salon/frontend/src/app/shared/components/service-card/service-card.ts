import { Component, input, output } from '@angular/core';
import { Service } from '../../../core/models/service.model';

@Component({
  selector: 'app-service-card',
  standalone: true,
  templateUrl: './service-card.html',
  styleUrl: './service-card.css',
})
export class ServiceCard {
  readonly service = input.required<Service>();
  readonly book = output<string>();
}
