import { describe, it, expect, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core';
import { StepServiceComponent } from './step-service.component';
import { WizardStateService } from './wizard-state.service';
import { ServiceService } from '../../../domains/services/service.service';
import { BusinessService } from '../../../domains/business/business.service';
import { WhatsappMessageService } from '../../../domains/booking/services/whatsapp-message.service';
import type { Service } from '../../../domains/services/service.model';

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

function setup(options: { services?: readonly Service[] | null; hasError?: boolean } = {}) {
  TestBed.configureTestingModule({
    imports: [StepServiceComponent],
    providers: [
      {
        provide: ServiceService,
        useValue: {
          getAll: () => of([...mockServices]),
          error: signal(options.hasError ?? false),
        },
      },
      {
        provide: BusinessService,
        useValue: { exceptions: () => undefined, getDaySchedule: () => undefined },
      },
      { provide: WhatsappMessageService, useValue: {} },
    ],
  });

  const fixture = TestBed.createComponent(StepServiceComponent);
  const wizard = TestBed.inject(WizardStateService);
  fixture.componentRef.setInput('services', 'services' in options ? options.services : mockServices);
  fixture.detectChanges();

  return { fixture, wizard, el: fixture.nativeElement as HTMLElement };
}

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

describe('StepServiceComponent', () => {
  it('renderiza una card por servicio con nombre, duración y precio', () => {
    const { el } = setup();
    const cards = el.querySelectorAll('.service-grid .service-option');
    expect(cards.length).toBe(2);
    expect(el.querySelector('.service-grid .option-name')?.textContent?.trim()).toBe('Corte');
    expect(el.querySelector('.service-grid .option-price')?.textContent?.trim()).toBe('$ 5.500');
  });

  it('renderiza la pseudo-card "Otro" con variant subtle', () => {
    const { el } = setup();
    const otherCard = el.querySelector<HTMLElement>('.service-other app-service-option-card');
    expect(otherCard).toBeTruthy();
    expect(otherCard?.classList.contains('is-subtle')).toBe(true);
    expect(el.querySelector('.service-other .option-name')?.textContent?.trim()).toBe(
      'Otro / No estoy segura',
    );
  });

  it('no renderiza cards si services es null', () => {
    const { el } = setup({ services: null });
    expect(el.querySelectorAll('.service-grid .service-option').length).toBe(0);
  });

  it('seleccionar un servicio actualiza wizard.selectedServiceId', () => {
    const { fixture, el, wizard } = setup();
    const firstCard = el.querySelectorAll<HTMLElement>('.service-grid .service-option')[0]!;
    firstCard.click();
    fixture.detectChanges();
    expect(wizard.selectedServiceId()).toBe('s1');
  });

  it('la pseudo-card "other" se selecciona y marca isSelected', () => {
    const { fixture, el, wizard } = setup();
    const otherButton = el.querySelector<HTMLElement>('.service-other .service-option')!;
    otherButton.click();
    fixture.detectChanges();
    expect(wizard.selectedServiceId()).toBe('other');
    expect(
      el.querySelector<HTMLElement>('.service-other app-service-option-card')?.classList.contains('is-selected'),
    ).toBe(true);
  });

  it('muestra el error de paso cuando attemptedSubmit y sin servicio', () => {
    const { fixture, el, wizard } = setup();
    wizard.attemptedSubmit.set(true);
    fixture.detectChanges();
    const err = el.querySelector('.step-error');
    expect(err).toBeTruthy();
    expect(err?.textContent?.trim()).toBe('Elige un servicio para continuar');
  });

  it('oculta el error de paso cuando hay servicio seleccionado', () => {
    const { fixture, el, wizard } = setup();
    wizard.attemptedSubmit.set(true);
    wizard.selectService('s1');
    fixture.detectChanges();
    expect(el.querySelector('.step-error')).toBeFalsy();
  });

  it('muestra el error boundary cuando falló la carga de servicios', () => {
    const { fixture, el } = setup({ hasError: true });
    fixture.detectChanges();
    expect(el.querySelector('app-error-boundary')).toBeTruthy();
  });
});
