import { Component, computed, ElementRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ErrorBoundary } from '../../shared/components/error-boundary/error-boundary';
import { FormFieldComponent } from '../../shared/components/form-field/form-field';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { ServiceOptionCard } from '../../shared/components/service-option-card/service-option-card';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { ServiceService } from '../../domains/services/service.service';
import { BusinessService } from '../../domains/business/business.service';
import type { DayOfWeek } from '../../domains/business/business.model';
import { ContactService } from '../../domains/contact/contact.service';
import { WhatsappMessageService } from '../../domains/booking/services/whatsapp-message.service';
import type { WizardStep } from '../../domains/booking/models/booking.model';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ErrorBoundary, FormFieldComponent, SectionHeader, ServiceOptionCard, SvgIcon, FormsModule],
  host: { class: 'section-padding' },
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  private readonly serviceService = inject(ServiceService);

  private readonly contactService = inject(ContactService);
  private readonly businessService = inject(BusinessService);

  readonly contactTitle = computed(() => this.contactService.config().title);
  readonly contactSubtitle = computed(() => this.contactService.config().subtitle);

  // ─── Datos ───────────────────────────────────────

  readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });
  readonly hasError = this.serviceService.error;
  readonly pasoLabels = computed(() => this.contactService.config().wizardSteps);
  readonly address = computed(() => this.businessService.data().contact.address);
  readonly phone = computed(() => this.businessService.data().contact.phone.display);
  readonly email = computed(() => this.businessService.data().contact.email);
  readonly businessHours = this.businessService.businessHours;
  readonly isOpenNow = this.businessService.isOpenNow;

  readonly morningSlots = computed(() => this.contactService.config().timeSlots.morning);
  readonly afternoonSlots = computed(() => this.contactService.config().timeSlots.afternoon);

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

  /** Traducción de Date.getDay() (0=domingo) a DayOfWeek. */
  private static readonly DAY_MAP: readonly string[] = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday',
  ];

  get minDate(): string {
    return new Date().toLocaleDateString('en-CA', {
      timeZone: 'America/Mexico_City',
    });
  }

  get isClosedDay(): boolean {
    if (!this.selectedDate) return false;

    // 1. Verificar excepciones para la fecha seleccionada
    const exception = this.businessService
      .exceptions()
      ?.find((ex) => ex.date === this.selectedDate);
    if (exception) return exception.type === 'closed';

    // 2. Verificar horario regular del día
    const day = ContactComponent.DAY_MAP[new Date(this.selectedDate + 'T12:00:00').getDay()] as DayOfWeek;
    const schedule = this.businessService.getDaySchedule(day);
    return !schedule || schedule.shifts.length === 0;
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
