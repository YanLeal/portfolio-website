import { Component, computed, ElementRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { ServiceService } from '../../core/services/service.service';
import { ConfigService } from '../../core/services/config.service';
import { WhatsappMessageService } from '../../core/services/whatsapp-message.service';
import type { WizardStep } from '../../core/types';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [SectionHeader, SvgIcon, FormsModule],
  host: { class: 'section-padding' },
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  private readonly serviceService = inject(ServiceService);

  private readonly configService = inject(ConfigService);

  readonly contactTitle = computed(() => this.configService.config()?.sections.contact.title ?? 'Reservá tu cita');
  readonly contactSubtitle = computed(() => this.configService.config()?.sections.contact.subtitle ?? 'Elegí el servicio, el día y el horario');

  // ─── Datos ───────────────────────────────────────

  readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });
  readonly hasError = this.serviceService.error;
  readonly pasoLabels = computed(() => this.configService.config()?.sections.contact.wizardSteps ?? ['Servicio', 'Fecha', 'Datos', 'Confirmar']);
  readonly address = computed(() => this.configService.config()?.contact.address ?? '');
  readonly phone = computed(() => this.configService.config()?.contact.phone.display ?? '');
  readonly email = computed(() => this.configService.config()?.contact.email ?? '');
  readonly schedule = computed(() => 'Lun a Sáb: 9:00 – 20:00');

  readonly morningSlots = computed(() => this.configService.config()?.sections.contact.timeSlots.morning ?? ['09:00', '10:00', '11:00']);
  readonly afternoonSlots = computed(() => this.configService.config()?.sections.contact.timeSlots.afternoon ?? ['14:00', '15:00', '16:00', '17:00']);

  // ─── Wizard state ───────────────────────────────

  step: WizardStep = 1;
  submitted = false;
  attemptedSubmit = false;
  popupBlocked = false;

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
      case 2: return !this.isClosedDay;
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

  /** Enter desde cualquier input/button del wizard avanza al siguiente paso */
  onStepEnter(event: Event): void {
    // En textarea Enter es nueva línea, no navegar
    if ((event.target as HTMLElement)?.tagName === 'TEXTAREA') return;
    this.nextStep();
  }

  nextStep(): void {
    if (!this.canGoNext || this.step >= 4) {
      this.attemptedSubmit = true;
      return;
    }
    this.attemptedSubmit = false;
    this.step = (this.step + 1) as WizardStep;
    this.focusStepHeading();
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
    const svc = this.services().find((s) => s.id === this.selectedServiceId);
    if (svc) return svc;
    if (this.selectedServiceId === 'other') {
      return {
        id: 'other' as const,
        name: 'Consulta general / Otro',
        duration: '—',
        price: 0,
      };
    }
    return undefined;
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

  /** Construye la URL de WhatsApp para usarla en el template (fallback popup bloqueado) */
  get waUrl(): string {
    const service = this.selectedService;
    if (!service) return '';
    return this.wa.buildUrl({
      name: this.name.trim(),
      service: service.name,
      date: this.selectedDate,
      time: this.selectedTime,
      notes: this.notes.trim() || undefined,
    });
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

    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      this.popupBlocked = true;
    }
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
    this.popupBlocked = false;
    this.selectedServiceId = null;
    this.selectedDate = '';
    this.selectedTime = '';
    this.name = '';
    this.clientPhone = '';
    this.notes = '';
    setTimeout(() => this.focusElement('.wizard-title'));
  }
}
