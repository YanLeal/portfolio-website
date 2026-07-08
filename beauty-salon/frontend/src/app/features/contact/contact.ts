import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { SERVICES } from '../../core/data/content';

interface AppointmentRequest {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionHeader, FormsModule, SvgIcon],
  host: { class: 'section-padding' },
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  readonly services = SERVICES;

  readonly address = 'Av. Siempre Viva 123, Córdoba';
  readonly phone = '+54 351 555-0123';
  readonly email = 'info@bellezaestilo.com';
  readonly schedule = 'Lun a Sáb: 9:00 – 20:00';

  model: AppointmentRequest = {
    name: '',
    phone: '',
    email: '',
    service: '',
    date: '',
  };

  submitted = false;

  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  onSubmit(): void {
    // TODO: enviar por correo — integrar con servicio de email
    // this.appointmentService.send(this.model).subscribe(...)
    console.log('Appointment request:', this.model);
    this.submitted = true;
  }

  resetForm(): void {
    this.submitted = false;
    this.model = { name: '', phone: '', email: '', service: '', date: '' };
  }
}
