import { Component, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { SERVICES } from '../../core/data/content';
import { WhatsappMessageService } from '../../core/services/whatsapp-message.service';

type WizardStep = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionHeader, SvgIcon, FormsModule],
  host: { class: 'section-padding' },
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  // ─── Datos ───────────────────────────────────────

  readonly services = SERVICES;
  readonly pasoLabels = ['Servicio', 'Fecha', 'Datos', 'Confirmar'];
  readonly address = 'Av. Siempre Viva 123, Córdoba';
  readonly phone = '+52 442 301 8772';
  readonly email = 'info@bellezaestilo.com';
  readonly schedule = 'Lun a Sáb: 9:00 – 20:00';

  readonly morningSlots = ['09:00', '10:00', '11:00'];
  readonly afternoonSlots = ['14:00', '15:00', '16:00', '17:00'];

  // ─── Wizard state ───────────────────────────────

  step: WizardStep = 1;
  submitted = false;
  attemptedSubmit = false;

  selectedServiceId: string | null = null;
  selectedDate = '';
  selectedTime = '';
  name = '';
  clientPhone = '';
  notes = '';

  // ─── Navigation ─────────────────────────────────

  get canGoNext(): boolean {
    switch (this.step) {
      case 1: return this.selectedServiceId !== null;
      case 2: return true; // ambos opcionales
      case 3: return this.name.trim() !== '' && this.clientPhone.trim().length >= 8;
      default: return false;
    }
  }

  get isLastStep(): boolean {
    return this.step === 4;
  }

  selectService(id: string): void {
    this.selectedServiceId = id;
  }

  selectTime(slot: string): void {
    this.selectedTime = slot;
  }

  nextStep(): void {
    if (this.step === 3) {
      this.attemptedSubmit = true;
    }
    if (this.canGoNext && this.step < 4) {
      this.attemptedSubmit = false;
      this.step = (this.step + 1) as WizardStep;
      this.focusStepHeading();
    }
  }

  prevStep(): void {
    if (this.step > 1) {
      this.attemptedSubmit = false;
      this.step = (this.step - 1) as WizardStep;
      this.focusStepHeading();
    }
  }

  // ─── Helpers ────────────────────────────────────

  get selectedService() {
    return this.services.find((s) => s.id === this.selectedServiceId);
  }

  get minDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  get isClosedDay(): boolean {
    if (!this.selectedDate) return false;
    return new Date(this.selectedDate).getDay() === 0; // 0 = Sunday
  }

  // ─── WhatsApp service ────────────────────────────────

  private readonly wa = inject(WhatsappMessageService);
  private readonly el = inject(ElementRef);

  // ─── Confirm (UI only — no backend) ─────────────

  onSubmit(): void {
    const service = this.selectedService;
    if (!service || !this.name.trim() || this.clientPhone.trim().length < 8) return;
    this.submitted = true;
    // Esperar a que Angular renderice el success state
    setTimeout(() => this.focusElement('.booking-success h3'));
  }

  /** Mueve el foco al título del paso activo después de navegar */
  private focusStepHeading(): void {
    setTimeout(() => this.focusElement('.wizard-title'));
  }

  private focusElement(selector: string): void {
    const el = this.el.nativeElement.querySelector(selector);
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }

  openWhatsApp(): void {
    const service = this.selectedService;
    if (!service) return;

    const url = this.wa.buildUrl({
      name: this.name.trim(),
      service: service.name,
      date: this.selectedDate,
      time: this.selectedTime,
      notes: this.notes.trim() || undefined,
    });

    window.open(url, '_blank');
  }

  get waMessageText(): string {
    const service = this.selectedService;
    if (!service) return '';
    return this.wa.buildText({
      name: this.name.trim(),
      service: service.name,
      date: this.selectedDate,
      time: this.selectedTime,
      notes: this.notes.trim() || undefined,
    });
  }

  resetForm(): void {
    this.step = 1;
    this.submitted = false;
    this.attemptedSubmit = false;
    this.selectedServiceId = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.name = '';
    this.clientPhone = '';
    this.notes = '';
    setTimeout(() => this.focusElement('.wizard-title'));
  }
}
