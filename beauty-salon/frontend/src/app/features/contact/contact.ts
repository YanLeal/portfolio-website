import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionHeader],
  templateUrl: './contact.html',
})
export class ContactComponent {
  readonly address = 'Av. Siempre Viva 123, Córdoba';
  readonly phone = '+54 351 555-0123';
  readonly email = 'info@bellezaestilo.com';
  readonly schedule = 'Lun a Sáb: 9:00 – 20:00';
}
