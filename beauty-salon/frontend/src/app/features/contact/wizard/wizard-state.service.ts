import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ServiceService } from '../../../domains/services/service.service';
import { BusinessService } from '../../../domains/business/business.service';
import { WhatsappMessageService } from '../../../domains/booking/services/whatsapp-message.service';
import type { Service } from '../../../domains/services/service.model';
import type { DayOfWeek } from '../../../domains/business/business.model';
import type { WizardStep } from '../../../domains/booking/models/booking.model';

/** Pseudo-service shown in the wizard when the user picks "Otro / No estoy segura". */
const OTHER_SERVICE: Service = {
  id: 'other',
  name: 'Consulta general / Otro',
  duration: '—',
  price: 0,
} as Service;

/**
 * Booking wizard state (service, date, time and customer data).
 *
 * Exposes the whole wizard state surface as signals (writable) and derived
 * computeds, plus the navigation methods. No DOM access: focus and any
 * visual side effects are handled by the container.
 */
@Injectable({ providedIn: 'root' })
export class WizardStateService {
  private readonly serviceService = inject(ServiceService);
  private readonly businessService = inject(BusinessService);
  private readonly wa = inject(WhatsappMessageService);

  /** Maps Date.getDay() (0=Sunday) to DayOfWeek. */
  private static readonly DAY_MAP: readonly string[] = [
    'sunday', 'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday',
  ];

  // ─── Writable state ────────────────────────────────

  readonly step = signal<WizardStep>(1);
  readonly submitted = signal(false);
  readonly attemptedSubmit = signal(false);
  readonly popupBlocked = signal(false);

  readonly selectedServiceId = signal<string | null>(null);
  readonly selectedDate = signal('');
  readonly selectedTime = signal('');
  readonly name = signal('');
  readonly clientPhone = signal('');
  readonly notes = signal('');

  // ─── Derived state ─────────────────────────────────

  /** Service catalog (shared observable, does not duplicate the request). */
  private readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });

  readonly selectedService = computed(() => {
    const id = this.selectedServiceId();
    if (id === 'other') return OTHER_SERVICE;
    if (id === null) return null;
    return this.services().find((s) => s.id === id) ?? undefined;
  });

  readonly minDate = computed(() =>
    new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }),
  );

  readonly isClosedDay = computed(() => {
    const date = this.selectedDate();
    if (!date) return false;

    // 1. Check for schedule exceptions on the selected date
    const exception = this.businessService
      .exceptions()
      ?.find((ex) => ex.date === date);
    if (exception) return exception.type === 'closed';

    // 2. Check the regular schedule for the day
    const day = WizardStateService.DAY_MAP[new Date(date + 'T12:00:00').getDay()] as DayOfWeek;
    const schedule = this.businessService.getDaySchedule(day);
    return !schedule || schedule.shifts.length === 0;
  });

  readonly isLastStep = computed(() => this.step() === 4);

  readonly waUrl = computed(() => {
    const service = this.selectedService();
    if (!service) return '';
    return this.wa.buildUrl({
      name: this.name().trim(),
      service: service.name,
      date: this.selectedDate(),
      time: this.selectedTime(),
      notes: this.notes().trim() || undefined,
    });
  });

  readonly waMessageText = computed(() => {
    const service = this.selectedService();
    if (!service) return '';
    return this.wa.buildText({
      name: this.name().trim(),
      service: service.name,
      date: this.selectedDate(),
      time: this.selectedTime(),
      notes: this.notes().trim() || undefined,
    });
  });

  // ─── Navigation ────────────────────────────────────

  canGoNext(): boolean {
    switch (this.step()) {
      case 1: return this.selectedServiceId() !== null;
      case 2: return !this.isClosedDay();
      case 3: return this.name().trim() !== '' && this.clientPhone().trim().length >= 8;
      default: return false;
    }
  }

  selectService(id: string | null): void {
    this.selectedServiceId.set(id);
  }

  selectTime(slot: string): void {
    this.selectedTime.set(slot);
  }

  nextStep(): void {
    if (!this.canGoNext() || this.step() >= 4) {
      this.attemptedSubmit.set(true);
      return;
    }
    this.attemptedSubmit.set(false);
    this.step.set((this.step() + 1) as WizardStep);
  }

  prevStep(): void {
    if (this.step() > 1) {
      this.attemptedSubmit.set(false);
      this.step.set((this.step() - 1) as WizardStep);
    }
  }

  // ─── Confirm (UI only — no backend) ────────────────

  onSubmit(): boolean {
    const service = this.selectedService();
    if (!service || !this.name().trim() || this.clientPhone().trim().length < 8) return false;
    this.submitted.set(true);
    return true;
  }

  openWhatsApp(): boolean {
    const service = this.selectedService();
    if (!service) return false;

    const url = this.wa.buildUrl({
      name: this.name().trim(),
      service: service.name,
      date: this.selectedDate(),
      time: this.selectedTime(),
      notes: this.notes().trim() || undefined,
    });

    const win = window.open(url, '_blank');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      this.popupBlocked.set(true);
      return false;
    }
    return true;
  }

  resetForm(): void {
    this.step.set(1);
    this.submitted.set(false);
    this.attemptedSubmit.set(false);
    this.popupBlocked.set(false);
    this.selectedServiceId.set(null);
    this.selectedDate.set('');
    this.selectedTime.set('');
    this.name.set('');
    this.clientPhone.set('');
    this.notes.set('');
  }
}
