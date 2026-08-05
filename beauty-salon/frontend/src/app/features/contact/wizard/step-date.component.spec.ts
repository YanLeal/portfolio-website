import { describe, it, expect, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StepDateComponent } from './step-date.component';
import { WizardStateService } from './wizard-state.service';
import { ServiceService } from '../../../domains/services/service.service';
import { BusinessService } from '../../../domains/business/business.service';
import { WhatsappMessageService } from '../../../domains/booking/services/whatsapp-message.service';
import type { DayOfWeek } from '../../../domains/business/business.model';

const morning = ['09:00', '10:00', '11:00'];
const afternoon = ['14:00', '15:00', '16:00', '17:00'];

function setup(options: { exceptions?: unknown[]; regular?: unknown[] } = {}) {
  TestBed.configureTestingModule({
    imports: [StepDateComponent],
    providers: [
      { provide: ServiceService, useValue: { getAll: () => of([]) } },
      {
        provide: BusinessService,
        useValue: {
          exceptions: () => options.exceptions ?? undefined,
          getDaySchedule: (day: DayOfWeek) =>
            (options.regular as Array<{ day: DayOfWeek; shifts: readonly unknown[] }> | undefined)?.find(
              (d) => d.day === day,
            ),
        },
      },
      { provide: WhatsappMessageService, useValue: {} },
    ],
  });

  const fixture = TestBed.createComponent(StepDateComponent);
  const wizard = TestBed.inject(WizardStateService);
  fixture.componentRef.setInput('morningSlots', morning);
  fixture.componentRef.setInput('afternoonSlots', afternoon);
  fixture.detectChanges();

  return { fixture, wizard, el: fixture.nativeElement as HTMLElement };
}

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

describe('StepDateComponent', () => {
  it('renderiza los slots de mañana y tarde', () => {
    const { el } = setup();
    const slots = [...el.querySelectorAll<HTMLButtonElement>('.time-slot')].map((b) => b.textContent?.trim());
    expect(slots).toEqual([...morning, ...afternoon]);
  });

  it('cada slot tiene el aria-label "Horario de las {slot}"', () => {
    const { el } = setup();
    const first = el.querySelector<HTMLButtonElement>('.time-slot')!;
    expect(first.getAttribute('aria-label')).toBe('Horario de las 09:00');
  });

  it('elegir un horario actualiza wizard.selectedTime y marca is-selected', () => {
    const { fixture, el, wizard } = setup();
    const slot = el.querySelectorAll<HTMLButtonElement>('.time-slot')[2]!; // 11:00
    slot.click();
    fixture.detectChanges();
    expect(wizard.selectedTime()).toBe('11:00');
    expect(slot.classList.contains('is-selected')).toBe(true);
  });

  it('el input de fecha lleva el [min] de wizard.minDate', () => {
    const { el, wizard } = setup();
    const dateInput = el.querySelector<HTMLInputElement>('#booking-date')!;
    expect(dateInput.getAttribute('min')).toBe(wizard.minDate());
  });

  it('dos-way binding: escribir la fecha actualiza wizard.selectedDate', () => {
    const { fixture, el, wizard } = setup();
    const dateInput = el.querySelector<HTMLInputElement>('#booking-date')!;
    dateInput.value = '2026-08-05';
    dateInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(wizard.selectedDate()).toBe('2026-08-05');
  });

  it('muestra el mensaje de día cerrado y oculta los horarios en un día cerrado', () => {
    const sundayClosed = [{ day: 'sunday', shifts: [] }];
    const { fixture, el, wizard } = setup({ regular: sundayClosed });
    wizard.selectedDate.set('2026-08-09');
    fixture.detectChanges();
    expect(el.querySelector('.closed-day')).toBeTruthy();
    expect(el.querySelectorAll('.time-slot').length).toBe(0);
  });

  it('en un día abierto muestra los horarios y no el mensaje de cerrado', () => {
    const tuesdayOpen = [{ day: 'tuesday', shifts: [{ start: '09:00', end: '19:00' }] }];
    const { fixture, el, wizard } = setup({ regular: tuesdayOpen });
    wizard.selectedDate.set('2026-08-04');
    fixture.detectChanges();
    expect(el.querySelector('.closed-day')).toBeFalsy();
    expect(el.querySelectorAll('.time-slot').length).toBe(morning.length + afternoon.length);
  });

  it('marca is-error en el día cerrado cuando attemptedSubmit', () => {
    const sundayClosed = [{ day: 'sunday', shifts: [] }];
    const { fixture, el, wizard } = setup({ regular: sundayClosed });
    wizard.selectedDate.set('2026-08-09');
    wizard.attemptedSubmit.set(true);
    fixture.detectChanges();
    const closed = el.querySelector<HTMLElement>('.closed-day')!;
    expect(closed.classList.contains('is-error')).toBe(true);
  });
});
