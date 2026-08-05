import { describe, it, expect, vi, afterEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { ContactComponent } from './contact';
import { WizardStateService } from './wizard/wizard-state.service';
import { ServiceService } from '../../domains/services/service.service';
import { BusinessService } from '../../domains/business/business.service';
import { ContactService } from '../../domains/contact/contact.service';
import { WhatsappMessageService } from '../../domains/booking/services/whatsapp-message.service';
import type { Service } from '../../domains/services/service.model';
import type { BusinessConfig } from '../../domains/business/business.model';
import type { ContactConfig } from '../../domains/contact/contact.model';

const mockServices: readonly Service[] = [
  {
    id: 's1',
    name: 'Corte',
    description: 'Corte de pelo',
    price: 5500,
    durationMinutes: 45,
    duration: '45 min',
    icon: 'scissors',
    category: 'cabello',
    sortOrder: 0,
  },
  {
    id: 's2',
    name: 'Brushing',
    description: 'Brushing completo',
    price: 4200,
    durationMinutes: 30,
    duration: '30 min',
    icon: 'brush',
    category: 'cabello',
    sortOrder: 1,
  },
];

const mockContactConfig: ContactConfig = {
  title: 'Reserva tu cita',
  subtitle: 'Elige el servicio, el día y el horario',
  wizardSteps: ['Servicio', 'Fecha', 'Datos', 'Confirmar'],
  timeSlots: {
    morning: ['09:00', '10:00', '11:00'],
    afternoon: ['14:00', '15:00', '16:00', '17:00'],
  },
};

const mockBusiness: BusinessConfig = {
  site: { name: 'Belleza Estilo', url: '', description: '', logo: '' },
  contact: {
    phone: { display: '442 301 6543', tel: '+525512345678' },
    whatsapp: '5490000000000',
    email: 'info@bellezaestilo.com',
    address: 'Av. Siempre Viva 123, Querétaro',
    social: { instagram: '', facebook: '' },
    schedule: {
      regular: [{ day: 'tuesday', shifts: [{ start: '09:00', end: '19:00' }] }],
    },
  },
  seo: { title: '', description: '', ogImage: '', ogLocale: 'es_AR', canonical: '' },
};

/** Tuesday 2026-08-04 is open; the day before/after has no schedule. */
const mockHours = [
  { day: 'monday', label: 'Lunes', hours: '09:00 – 19:00', isClosed: false },
  { day: 'sunday', label: 'Domingo', hours: 'Cerrado', isClosed: true },
];

function setup() {
  TestBed.configureTestingModule({
    imports: [ContactComponent],
    providers: [
      {
        provide: ServiceService,
        useValue: { getAll: () => of([...mockServices]), error: signal(false) },
      },
      {
        provide: BusinessService,
        useValue: {
          data: signal(mockBusiness),
          businessHours: signal(mockHours),
          isOpenNow: signal(true),
          exceptions: () => undefined,
          getDaySchedule: (day: string) =>
            mockBusiness.contact.schedule.regular.find((d) => d.day === day),
        },
      },
      { provide: ContactService, useValue: { config: signal(mockContactConfig) } },
      {
        provide: WhatsappMessageService,
        useValue: { buildUrl: () => 'https://wa.me/x', buildText: () => 'Hola!' },
      },
    ],
  });

  const fixture = TestBed.createComponent(ContactComponent);
  const wizard = TestBed.inject(WizardStateService);
  fixture.detectChanges();

  return { fixture, wizard, el: fixture.nativeElement as HTMLElement };
}

function type(el: HTMLElement, value: string): void {
  const input = el as HTMLInputElement;
  input.value = value;
  input.dispatchEvent(new Event('input'));
}

function clickButton(el: HTMLElement, text: string): void {
  const btn = [...el.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
    b.textContent?.includes(text),
  );
  expect(btn, `botón "${text}"`).toBeTruthy();
  btn!.click();
}

/** Navigates the wizard to the success state (service + date + data + submit). */
function walkToSuccess(fixture: ComponentFixture<ContactComponent>, el: HTMLElement): void {
  el.querySelectorAll<HTMLElement>('.service-grid .service-option')[0]!.click();
  fixture.detectChanges();
  clickButton(el, 'Continuar');
  fixture.detectChanges();
  type(el.querySelector<HTMLInputElement>('#booking-date')!, '2026-08-04');
  fixture.detectChanges();
  clickButton(el, 'Continuar');
  fixture.detectChanges();
  type(el.querySelector<HTMLInputElement>('#booking-name')!, 'Ana');
  type(el.querySelector<HTMLInputElement>('#booking-phone')!, '4423016543');
  fixture.detectChanges();
  clickButton(el, 'Continuar');
  fixture.detectChanges();
  clickButton(el, 'Pedir turno');
  fixture.detectChanges();
}

function key(el: HTMLElement, key: string, target?: HTMLElement): void {
  const node = target ?? el;
  node.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

describe('ContactComponent (wizard container)', () => {
  it('renderiza el sidebar con los datos del salón', () => {
    const { el } = setup();
    const sidebar = el.querySelector('app-contact-sidebar');
    expect(sidebar).toBeTruthy();
    expect(sidebar?.textContent).toContain('Av. Siempre Viva 123, Querétaro');
    expect(sidebar?.textContent).toContain('442 301 6543');
    expect(sidebar?.textContent).toContain('Abierto ahora');
  });

  it('happy path: servicio → fecha+horario → datos → confirmar → submit muestra el éxito y envía por WhatsApp', () => {
    const { fixture, el, wizard } = setup();

    // Paso 1: elegir servicio
    el.querySelectorAll<HTMLElement>('.service-grid .service-option')[0]!.click();
    fixture.detectChanges();
    expect(wizard.selectedServiceId()).toBe('s1');

    // Paso 2: fecha y horario
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(wizard.step()).toBe(2);
    expect(el.querySelector('app-step-date')).toBeTruthy();

    type(el.querySelector<HTMLInputElement>('#booking-date')!, '2026-08-04');
    fixture.detectChanges();
    el.querySelectorAll<HTMLButtonElement>('.time-slot')[1]!.click();
    fixture.detectChanges();
    expect(wizard.selectedDate()).toBe('2026-08-04');
    expect(wizard.selectedTime()).toBe('10:00');

    // Paso 3: datos
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(wizard.step()).toBe(3);
    expect(el.querySelector('app-step-data')).toBeTruthy();

    type(el.querySelector<HTMLInputElement>('#booking-name')!, 'Ana');
    type(el.querySelector<HTMLInputElement>('#booking-phone')!, '4423016543');
    fixture.detectChanges();

    // Paso 4: confirmar y enviar
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(wizard.step()).toBe(4);
    expect(el.querySelector('app-step-confirm')).toBeTruthy();

    const openSpy = vi
      .spyOn(window, 'open')
      .mockReturnValue({ closed: false } as unknown as Window);
    clickButton(el, 'Pedir turno');
    fixture.detectChanges();

    expect(wizard.submitted()).toBe(true);
    const success = el.querySelector<HTMLElement>('.booking-success');
    expect(success).toBeTruthy();
    expect(success?.querySelector('h3')?.textContent).toContain('Último paso');
    expect(success?.textContent).toContain('Corte');
    expect(success?.textContent).toContain('2026-08-04 a las 10:00 hs');

    clickButton(el, 'Enviar por WhatsApp');
    fixture.detectChanges();
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(wizard.popupBlocked()).toBe(false);
  });

  it('validaciones: no avanza sin servicio, el paso 2 avanza con fecha pero sin horario, el paso 3 bloquea teléfono corto', () => {
    const { fixture, el, wizard } = setup();

    // Paso 1 bloqueado sin servicio
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(wizard.step()).toBe(1);
    expect(wizard.attemptedSubmit()).toBe(true);

    el.querySelectorAll<HTMLElement>('.service-grid .service-option')[0]!.click();
    fixture.detectChanges();
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(wizard.step()).toBe(2);

    // Paso 2 avanza con fecha pero sin horario (horario opcional)
    type(el.querySelector<HTMLInputElement>('#booking-date')!, '2026-08-04');
    fixture.detectChanges();
    expect(wizard.canGoNext()).toBe(true);
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(wizard.step()).toBe(3);

    // Paso 3 bloqueado con teléfono corto
    type(el.querySelector<HTMLInputElement>('#booking-name')!, 'Ana');
    type(el.querySelector<HTMLInputElement>('#booking-phone')!, '123');
    fixture.detectChanges();
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(wizard.step()).toBe(3);
    expect(wizard.attemptedSubmit()).toBe(true);
  });

  it('reset: "Reservar otro turno" vuelve al paso 1 y limpia todo', () => {
    const { fixture, el, wizard } = setup();
    walkToSuccess(fixture, el);
    expect(el.querySelector('.booking-success')).toBeTruthy();

    clickButton(el, 'Reservar otro turno');
    fixture.detectChanges();

    expect(wizard.step()).toBe(1);
    expect(wizard.submitted()).toBe(false);
    expect(wizard.selectedServiceId()).toBeNull();
    expect(wizard.selectedDate()).toBe('');
    expect(wizard.selectedTime()).toBe('');
    expect(wizard.name()).toBe('');
    expect(wizard.clientPhone()).toBe('');
    expect(el.querySelector('.booking-success')).toBeFalsy();
    expect(el.querySelector('app-step-service')).toBeTruthy();
  });

  it('popup bloqueado: window.open null → aparece el fallback con el link de WhatsApp', () => {
    const { fixture, el, wizard } = setup();
    walkToSuccess(fixture, el);

    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    clickButton(el, 'Enviar por WhatsApp');
    fixture.detectChanges();

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(wizard.popupBlocked()).toBe(true);
    const blocked = el.querySelector<HTMLElement>('.popup-blocked');
    expect(blocked).toBeTruthy();
    expect(blocked?.textContent).toContain('El navegador bloqueó la ventana');
    expect(el.querySelector<HTMLAnchorElement>('.popup-link')?.getAttribute('href')).toBe(
      wizard.waUrl(),
    );
  });

  it('teclado: Enter avanza (excepto en textarea) y Escape retrocede', () => {
    const { fixture, el, wizard } = setup();
    const wizardEl = el.querySelector<HTMLElement>('.wizard')!;

    // Enter sin servicio no avanza
    key(wizardEl, 'Enter');
    fixture.detectChanges();
    expect(wizard.step()).toBe(1);
    expect(wizard.attemptedSubmit()).toBe(true);

    // Enter con servicio avanza
    el.querySelectorAll<HTMLElement>('.service-grid .service-option')[0]!.click();
    fixture.detectChanges();
    key(wizardEl, 'Enter');
    fixture.detectChanges();
    expect(wizard.step()).toBe(2);

    // Escape retrocede
    key(wizardEl, 'Escape');
    fixture.detectChanges();
    expect(wizard.step()).toBe(1);

    // Avanzar hasta el paso 3
    el.querySelectorAll<HTMLElement>('.service-grid .service-option')[0]!.click();
    fixture.detectChanges();
    key(wizardEl, 'Enter');
    fixture.detectChanges();
    type(el.querySelector<HTMLInputElement>('#booking-date')!, '2026-08-04');
    fixture.detectChanges();
    key(wizardEl, 'Enter');
    fixture.detectChanges();
    expect(wizard.step()).toBe(3);

    // Enter en el textarea no navega
    const textarea = el.querySelector<HTMLTextAreaElement>('#booking-notes')!;
    key(wizardEl, 'Enter', textarea);
    fixture.detectChanges();
    expect(wizard.step()).toBe(3);
  });

  it('el indicador de progreso refleja is-active / is-done / is-error', () => {
    const { fixture, el } = setup();
    const steps = () => [...el.querySelectorAll<HTMLElement>('.progress-step')];

    // Paso 1 activo
    expect(steps()[0].classList.contains('is-active')).toBe(true);
    expect(steps()[0].classList.contains('is-done')).toBe(false);

    // Continuar sin servicio → is-error en el paso actual
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(steps()[0].classList.contains('is-error')).toBe(true);

    // Elegir servicio y avanzar → paso 1 is-done, paso 2 is-active
    el.querySelectorAll<HTMLElement>('.service-grid .service-option')[0]!.click();
    fixture.detectChanges();
    clickButton(el, 'Continuar');
    fixture.detectChanges();
    expect(steps()[0].classList.contains('is-done')).toBe(true);
    expect(steps()[0].classList.contains('is-error')).toBe(false);
    expect(steps()[1].classList.contains('is-active')).toBe(true);
  });
});
