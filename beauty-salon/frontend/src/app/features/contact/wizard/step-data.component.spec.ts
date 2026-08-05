import { describe, it, expect, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StepDataComponent } from './step-data.component';
import { WizardStateService } from './wizard-state.service';
import { ServiceService } from '../../../domains/services/service.service';
import { BusinessService } from '../../../domains/business/business.service';
import { WhatsappMessageService } from '../../../domains/booking/services/whatsapp-message.service';

function setup() {
  TestBed.configureTestingModule({
    imports: [StepDataComponent],
    providers: [
      { provide: ServiceService, useValue: { getAll: () => of([]) } },
      { provide: BusinessService, useValue: { exceptions: () => undefined, getDaySchedule: () => undefined } },
      { provide: WhatsappMessageService, useValue: {} },
    ],
  });

  const fixture = TestBed.createComponent(StepDataComponent);
  const wizard = TestBed.inject(WizardStateService);
  fixture.detectChanges();

  return { fixture, wizard, el: fixture.nativeElement as HTMLElement };
}

function type(el: HTMLElement, value: string): void {
  const input = el as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

describe('StepDataComponent', () => {
  it('two-way binding: escribir el nombre actualiza wizard.name', () => {
    const { fixture, el, wizard } = setup();
    const nameInput = el.querySelector<HTMLInputElement>('#booking-name')!;
    type(nameInput, 'María González');
    fixture.detectChanges();
    expect(wizard.name()).toBe('María González');
  });

  it('two-way binding: escribir el teléfono actualiza wizard.clientPhone', () => {
    const { fixture, el, wizard } = setup();
    const phoneInput = el.querySelector<HTMLInputElement>('#booking-phone')!;
    type(phoneInput, '4423016543');
    fixture.detectChanges();
    expect(wizard.clientPhone()).toBe('4423016543');
  });

  it('two-way binding: escribir las notas actualiza wizard.notes', () => {
    const { fixture, el, wizard } = setup();
    const notes = el.querySelector<HTMLTextAreaElement>('#booking-notes')!;
    type(notes, 'Color oscuro');
    fixture.detectChanges();
    expect(wizard.notes()).toBe('Color oscuro');
  });

  it('muestra mensaje de error de nombre vacío con attemptedSubmit', () => {
    const { fixture, el, wizard } = setup();
    wizard.attemptedSubmit.set(true);
    fixture.detectChanges();
    const nameInput = el.querySelector<HTMLInputElement>('#booking-name')!;
    expect(nameInput.classList.contains('is-invalid')).toBe(true);
    expect(el.textContent).toContain('Decinos tu nombre para poder contactarte');
  });

  it('muestra mensaje de teléfono corto con attemptedSubmit', () => {
    const { fixture, el, wizard } = setup();
    const phoneInput = el.querySelector<HTMLInputElement>('#booking-phone')!;
    type(phoneInput, '123');
    fixture.detectChanges();
    wizard.attemptedSubmit.set(true);
    fixture.detectChanges();
    expect(phoneInput.classList.contains('is-invalid')).toBe(true);
    expect(el.textContent).toContain('Parece muy corto');
  });

  it('muestra mensaje de teléfono requerido con attemptedSubmit', () => {
    const { fixture, el, wizard } = setup();
    wizard.attemptedSubmit.set(true);
    fixture.detectChanges();
    const phoneInput = el.querySelector<HTMLInputElement>('#booking-phone')!;
    expect(phoneInput.classList.contains('is-invalid')).toBe(true);
    expect(el.textContent).toContain('Necesitamos tu WhatsApp');
  });

  it('marca is-valid en el nombre tocado y válido', () => {
    const { fixture, el } = setup();
    const nameInput = el.querySelector<HTMLInputElement>('#booking-name')!;
    type(nameInput, 'Ana');
    nameInput.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(nameInput.classList.contains('is-valid')).toBe(true);
  });

  it('sin interacción ni attemptedSubmit no muestra errores', () => {
    const { el } = setup();
    expect(el.querySelector('.form-error')).toBeFalsy();
    expect(el.querySelector<HTMLInputElement>('#booking-name')?.classList.contains('is-invalid')).toBe(false);
  });
});
