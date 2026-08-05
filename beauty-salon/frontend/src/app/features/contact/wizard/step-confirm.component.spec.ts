import { describe, it, expect, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { StepConfirmComponent } from './step-confirm.component';
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
];

function setup() {
  TestBed.configureTestingModule({
    imports: [StepConfirmComponent],
    providers: [
      {
        provide: ServiceService,
        useValue: { getAll: () => of([...mockServices]) },
      },
      { provide: BusinessService, useValue: { exceptions: () => undefined, getDaySchedule: () => undefined } },
      { provide: WhatsappMessageService, useValue: {} },
    ],
  });

  const fixture = TestBed.createComponent(StepConfirmComponent);
  const wizard = TestBed.inject(WizardStateService);
  fixture.detectChanges();

  return { fixture, wizard, el: fixture.nativeElement as HTMLElement };
}

function reviewValues(el: HTMLElement): Record<string, string> {
  const values: Record<string, string> = {};
  el.querySelectorAll<HTMLElement>('.review-row').forEach((row) => {
    const label = row.querySelector('.review-label')?.textContent?.trim() ?? '';
    const value = row.querySelector('.review-value')?.textContent?.trim() ?? '';
    values[label] = value;
  });
  return values;
}

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

describe('StepConfirmComponent', () => {
  it('no renderiza la review card sin servicio seleccionado', () => {
    const { el } = setup();
    expect(el.querySelector('.review-card')).toBeFalsy();
  });

  it('renderiza servicio, duración y precio formateado es-AR', () => {
    const { fixture, el, wizard } = setup();
    wizard.selectService('s1');
    wizard.selectedDate.set('2026-08-04');
    wizard.selectTime('10:00');
    wizard.name.set('Ana');
    wizard.clientPhone.set('4423016543');
    fixture.detectChanges();

    const values = reviewValues(el);
    expect(values['Servicio']).toBe('Corte');
    expect(values['Duración']).toBe('45 min');
    expect(values['Precio']).toBe('$5.500');
    expect(values['Fecha']).toBe('2026-08-04');
    expect(values['Horario']).toBe('10:00 hs');
    expect(values['Nombre']).toBe('Ana');
    expect(values['Celular']).toBe('4423016543');
  });

  it('usa "—" para fecha y horario vacíos', () => {
    const { fixture, el, wizard } = setup();
    wizard.selectService('s1');
    wizard.name.set('Ana');
    wizard.clientPhone.set('4423016543');
    fixture.detectChanges();

    const values = reviewValues(el);
    expect(values['Fecha']).toBe('—');
    expect(values['Horario']).toBe('—');
  });

  it('la pseudo-card "other" se renderiza en el resumen', () => {
    const { fixture, el, wizard } = setup();
    wizard.selectService('other');
    fixture.detectChanges();
    const values = reviewValues(el);
    expect(values['Servicio']).toBe('Consulta general / Otro');
    expect(values['Duración']).toBe('—');
  });

  it('solo muestra la fila de comentarios cuando hay notas', () => {
    const { fixture, el, wizard } = setup();
    wizard.selectService('s1');
    fixture.detectChanges();
    expect(el.textContent).not.toContain('Comentarios');

    wizard.notes.set('Sin perfume');
    fixture.detectChanges();
    const values = reviewValues(el);
    expect(values['Comentarios']).toBe('Sin perfume');
  });
});
