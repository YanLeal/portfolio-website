import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { WizardStateService } from './wizard-state.service';
import { ServiceService } from '../../../domains/services/service.service';
import { BusinessService } from '../../../domains/business/business.service';
import { WhatsappMessageService } from '../../../domains/booking/services/whatsapp-message.service';
import type { Service } from '../../../domains/services/service.model';
import type { BusinessDay, DayOfWeek, ScheduleException } from '../../../domains/business/business.model';
import type { WaMessageParams } from '../../../domains/booking/services/whatsapp-message.service';

const mockServices: readonly Service[] = [
  {
    id: 's1',
    name: 'Corte',
    description: 'Corte de pelo',
    price: 100,
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
    price: 200,
    durationMinutes: 30,
    duration: '30 min',
    icon: 'brush',
    category: 'cabello',
    sortOrder: 1,
  },
];

const tuesdayOpen: BusinessDay = { day: 'tuesday', shifts: [{ start: '09:00', end: '19:00' }] };
const sundayClosed: BusinessDay = { day: 'sunday', shifts: [] };

interface SetupOptions {
  services?: readonly Service[];
  exceptions?: readonly ScheduleException[];
  regular?: readonly BusinessDay[];
  buildUrl?: (params: WaMessageParams) => string;
  buildText?: (params: WaMessageParams) => string;
}

function setup(options: SetupOptions = {}) {
  const services = options.services ?? mockServices;

  const serviceService = {
    getAll: () => of([...services]),
  } as unknown as ServiceService;

  const businessService = {
    exceptions: () => options.exceptions,
    getDaySchedule: (day: DayOfWeek) => options.regular?.find((d) => d.day === day),
  } as unknown as BusinessService;

  const waService = {
    buildUrl: options.buildUrl ?? (() => 'https://wa.me/5490000000000?text=test'),
    buildText: options.buildText ?? (() => 'Hola!'),
  } as unknown as WhatsappMessageService;

  TestBed.configureTestingModule({
    providers: [
      { provide: ServiceService, useValue: serviceService },
      { provide: BusinessService, useValue: businessService },
      { provide: WhatsappMessageService, useValue: waService },
    ],
  });

  const service = TestBed.inject(WizardStateService);
  return { service, serviceService, businessService, waService };
}

afterEach(() => {
  TestBed.resetTestingModule();
  vi.restoreAllMocks();
});

describe('WizardStateService', () => {
  describe('estado inicial', () => {
    it('arranca en el paso 1', () => {
      const { service } = setup();
      expect(service.step()).toBe(1);
    });

    it('todos los flags en false y campos vacíos', () => {
      const { service } = setup();
      expect(service.submitted()).toBe(false);
      expect(service.attemptedSubmit()).toBe(false);
      expect(service.popupBlocked()).toBe(false);
      expect(service.selectedServiceId()).toBeNull();
      expect(service.selectedDate()).toBe('');
      expect(service.selectedTime()).toBe('');
      expect(service.name()).toBe('');
      expect(service.clientPhone()).toBe('');
      expect(service.notes()).toBe('');
    });

    it('selectedService es null sin servicio seleccionado', () => {
      const { service } = setup();
      expect(service.selectedService()).toBeNull();
    });

    it('isLastStep es false en el paso 1', () => {
      const { service } = setup();
      expect(service.isLastStep()).toBe(false);
    });
  });

  describe('canGoNext', () => {
    it('paso 1: false sin servicio y true al seleccionar', () => {
      const { service } = setup();
      expect(service.canGoNext()).toBe(false);
      service.selectService('s1');
      expect(service.canGoNext()).toBe(true);
    });

    it('paso 1: true con el pseudo-servicio "other"', () => {
      const { service } = setup();
      service.selectService('other');
      expect(service.canGoNext()).toBe(true);
    });

    it('paso 2: true sin fecha ni horario (ambos opcionales)', () => {
      const { service } = setup();
      service.selectService('s1');
      service.nextStep();
      expect(service.canGoNext()).toBe(true);
    });

    it('paso 2: true en un día abierto sin horario seleccionado', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      expect(service.canGoNext()).toBe(true);
    });

    it('paso 2: false en un día con excepción de cierre', () => {
      const { service } = setup({
        exceptions: [{ date: '2026-08-04', type: 'closed', reason: 'Test' }],
      });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      expect(service.canGoNext()).toBe(false);
    });

    it('paso 2: false en un día sin turnos', () => {
      const { service } = setup({ regular: [sundayClosed] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-09');
      expect(service.canGoNext()).toBe(false);
    });

    it('paso 3: false con nombre vacío', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      service.nextStep();
      service.clientPhone.set('4423016543');
      expect(service.canGoNext()).toBe(false);
    });

    it('paso 3: false con teléfono corto', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      service.nextStep();
      service.name.set('Ana');
      service.clientPhone.set('123');
      expect(service.canGoNext()).toBe(false);
    });

    it('paso 3: true con nombre y teléfono válidos', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      service.nextStep();
      service.name.set('  Ana  ');
      service.clientPhone.set('4423016543');
      expect(service.canGoNext()).toBe(true);
    });

    it('paso 4: false (default)', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      service.nextStep();
      service.name.set('Ana');
      service.clientPhone.set('4423016543');
      service.nextStep();
      expect(service.canGoNext()).toBe(false);
    });
  });

  describe('navegación — nextStep / prevStep', () => {
    it('avanza 1 → 2 → 3 → 4', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      expect(service.step()).toBe(1);

      service.selectService('s1');
      service.nextStep();
      expect(service.step()).toBe(2);

      service.selectedDate.set('2026-08-04');
      service.nextStep();
      expect(service.step()).toBe(3);

      service.name.set('Ana');
      service.clientPhone.set('4423016543');
      service.nextStep();
      expect(service.step()).toBe(4);
    });

    it('no avanza más allá del paso 4', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      service.nextStep();
      service.name.set('Ana');
      service.clientPhone.set('4423016543');
      service.nextStep();

      service.nextStep();
      expect(service.step()).toBe(4);
      expect(service.attemptedSubmit()).toBe(true);
    });

    it('prevStep no baja del paso 1', () => {
      const { service } = setup();
      service.prevStep();
      expect(service.step()).toBe(1);
      expect(service.attemptedSubmit()).toBe(false);
    });

    it('prevStep vuelve al paso anterior', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      service.nextStep();
      expect(service.step()).toBe(3);

      service.prevStep();
      expect(service.step()).toBe(2);
    });

    it('nextStep bloqueado setea attemptedSubmit y no avanza', () => {
      const { service } = setup();
      expect(service.canGoNext()).toBe(false);
      service.nextStep();
      expect(service.step()).toBe(1);
      expect(service.attemptedSubmit()).toBe(true);
    });

    it('nextStep exitoso limpia attemptedSubmit', () => {
      const { service } = setup();
      service.nextStep();
      expect(service.attemptedSubmit()).toBe(true);

      service.selectService('s1');
      service.nextStep();
      expect(service.attemptedSubmit()).toBe(false);
      expect(service.step()).toBe(2);
    });

    it('prevStep limpia attemptedSubmit', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      service.nextStep();

      service.nextStep(); // bloqueado (paso 3 sin datos)
      expect(service.attemptedSubmit()).toBe(true);

      service.prevStep();
      expect(service.attemptedSubmit()).toBe(false);
      expect(service.step()).toBe(2);
    });
  });

  describe('selectService / selectTime', () => {
    it('selectService setea selectedServiceId', () => {
      const { service } = setup();
      service.selectService('s2');
      expect(service.selectedServiceId()).toBe('s2');
    });

    it('selectService(null) limpia la selección', () => {
      const { service } = setup();
      service.selectService('s1');
      service.selectService(null);
      expect(service.selectedServiceId()).toBeNull();
      expect(service.selectedService()).toBeNull();
    });

    it('selectedService devuelve el servicio del catálogo', () => {
      const { service } = setup();
      service.selectService('s1');
      expect(service.selectedService()).toEqual(mockServices[0]);
    });

    it('selectedService devuelve el pseudo-servicio "other"', () => {
      const { service } = setup();
      service.selectService('other');
      expect(service.selectedService()).toEqual({
        id: 'other',
        name: 'Consulta general / Otro',
        duration: '—',
        price: 0,
      });
    });

    it('selectedService devuelve undefined con un id desconocido', () => {
      const { service } = setup();
      service.selectService('no-existe');
      expect(service.selectedService()).toBeUndefined();
    });

    it('selectTime setea selectedTime', () => {
      const { service } = setup();
      service.selectTime('10:00');
      expect(service.selectedTime()).toBe('10:00');
    });
  });

  describe('isClosedDay', () => {
    it('false sin fecha seleccionada', () => {
      const { service } = setup();
      expect(service.isClosedDay()).toBe(false);
    });

    it('false en un día abierto regular', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectedDate.set('2026-08-04');
      expect(service.isClosedDay()).toBe(false);
    });

    it('true con excepción de cierre para la fecha', () => {
      const { service } = setup({
        exceptions: [{ date: '2026-08-04', type: 'closed', reason: 'Test' }],
      });
      service.selectedDate.set('2026-08-04');
      expect(service.isClosedDay()).toBe(true);
    });

    it('false con excepción de horario especial para la fecha', () => {
      const { service } = setup({
        exceptions: [
          { date: '2026-08-04', type: 'special_hours', shifts: [{ start: '09:00', end: '14:00' }], reason: 'Test' },
        ],
      });
      service.selectedDate.set('2026-08-04');
      expect(service.isClosedDay()).toBe(false);
    });

    it('true en un día sin turnos', () => {
      const { service } = setup({ regular: [sundayClosed] });
      service.selectedDate.set('2026-08-09');
      expect(service.isClosedDay()).toBe(true);
    });

    it('true en un día sin horario definido', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectedDate.set('2026-08-05');
      expect(service.isClosedDay()).toBe(true);
    });
  });

  describe('resetForm', () => {
    it('restaura todos los campos a los valores iniciales', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.selectedDate.set('2026-08-04');
      service.selectTime('10:00');
      service.name.set('Ana');
      service.clientPhone.set('4423016543');
      service.notes.set('Notas');
      service.nextStep();
      service.nextStep();
      service.nextStep();
      service.onSubmit();
      expect(service.submitted()).toBe(true);

      service.resetForm();
      expect(service.step()).toBe(1);
      expect(service.submitted()).toBe(false);
      expect(service.attemptedSubmit()).toBe(false);
      expect(service.popupBlocked()).toBe(false);
      expect(service.selectedServiceId()).toBeNull();
      expect(service.selectedDate()).toBe('');
      expect(service.selectedTime()).toBe('');
      expect(service.name()).toBe('');
      expect(service.clientPhone()).toBe('');
      expect(service.notes()).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('devuelve false y no setea submitted sin servicio', () => {
      const { service } = setup();
      service.name.set('Ana');
      service.clientPhone.set('4423016543');
      expect(service.onSubmit()).toBe(false);
      expect(service.submitted()).toBe(false);
    });

    it('devuelve false y no setea submitted con nombre vacío', () => {
      const { service } = setup();
      service.selectService('s1');
      service.name.set('   ');
      service.clientPhone.set('4423016543');
      expect(service.onSubmit()).toBe(false);
      expect(service.submitted()).toBe(false);
    });

    it('devuelve false y no setea submitted con teléfono corto', () => {
      const { service } = setup();
      service.selectService('s1');
      service.name.set('Ana');
      service.clientPhone.set('123');
      expect(service.onSubmit()).toBe(false);
      expect(service.submitted()).toBe(false);
    });

    it('devuelve true y setea submitted con datos válidos sin requerir fecha/hora', () => {
      const { service } = setup();
      service.selectService('s1');
      service.name.set('Ana');
      service.clientPhone.set('4423016543');
      expect(service.onSubmit()).toBe(true);
      expect(service.submitted()).toBe(true);
    });
  });

  describe('openWhatsApp', () => {
    it('popup bloqueado: setea popupBlocked y devuelve false cuando window.open devuelve null', () => {
      const { service } = setup();
      service.selectService('s1');
      const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

      expect(service.openWhatsApp()).toBe(false);
      expect(service.popupBlocked()).toBe(true);
      expect(openSpy).toHaveBeenCalledTimes(1);
    });

    it('popup bloqueado: devuelve false si la ventana se abrió cerrada', () => {
      const { service } = setup();
      service.selectService('s1');
      vi.spyOn(window, 'open').mockReturnValue({ closed: true } as unknown as Window);

      expect(service.openWhatsApp()).toBe(false);
      expect(service.popupBlocked()).toBe(true);
    });

    it('devuelve true y no setea popupBlocked cuando la ventana abre', () => {
      const { service } = setup();
      service.selectService('s1');
      service.name.set('Ana');
      const openSpy = vi
        .spyOn(window, 'open')
        .mockReturnValue({ closed: false } as unknown as Window);

      expect(service.openWhatsApp()).toBe(true);
      expect(service.popupBlocked()).toBe(false);
      expect(openSpy).toHaveBeenCalledTimes(1);
    });

    it('construye la URL con buildUrl y la abre con _blank', () => {
      const buildUrl = vi.fn((params: WaMessageParams) => `https://wa.me/x?n=${params.name}`);
      const { service } = setup({ buildUrl });
      service.selectService('s1');
      service.name.set('  Ana  ');
      const openSpy = vi
        .spyOn(window, 'open')
        .mockReturnValue({ closed: false } as unknown as Window);

      service.openWhatsApp();

      expect(buildUrl).toHaveBeenCalledWith({
        name: 'Ana',
        service: 'Corte',
        date: '',
        time: '',
        notes: undefined,
      });
      expect(openSpy).toHaveBeenCalledWith('https://wa.me/x?n=Ana', '_blank');
    });

    it('devuelve false sin servicio y no llama window.open', () => {
      const { service } = setup();
      const openSpy = vi.spyOn(window, 'open');

      expect(service.openWhatsApp()).toBe(false);
      expect(service.popupBlocked()).toBe(false);
      expect(openSpy).not.toHaveBeenCalled();
    });
  });

  describe('waUrl / waMessageText', () => {
    it('waUrl es vacío sin servicio', () => {
      const { service } = setup();
      expect(service.waUrl()).toBe('');
    });

    it('waUrl construye la URL con el servicio y el nombre recortado', () => {
      const buildUrl = vi.fn(() => 'https://wa.me/x');
      const { service } = setup({ buildUrl });
      service.selectService('s1');
      service.name.set('  Ana  ');
      service.selectedDate.set('2026-08-04');
      service.selectTime('10:00');
      service.notes.set('   ');

      expect(service.waUrl()).toBe('https://wa.me/x');
      expect(buildUrl).toHaveBeenCalledWith({
        name: 'Ana',
        service: 'Corte',
        date: '2026-08-04',
        time: '10:00',
        notes: undefined,
      });
    });

    it('waMessageText es vacío sin servicio', () => {
      const { service } = setup();
      expect(service.waMessageText()).toBe('');
    });

    it('waMessageText delega en wa.buildText', () => {
      const buildText = vi.fn(() => 'Hola Ana!');
      const { service } = setup({ buildText });
      service.selectService('s1');
      service.name.set('Ana');

      expect(service.waMessageText()).toBe('Hola Ana!');
      expect(buildText).toHaveBeenCalledWith({
        name: 'Ana',
        service: 'Corte',
        date: '',
        time: '',
        notes: undefined,
      });
    });
  });

  describe('minDate / isLastStep', () => {
    it('minDate es la fecha de hoy en America/Mexico_City', () => {
      const { service } = setup();
      expect(service.minDate()).toBe(
        new Date().toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }),
      );
    });

    it('isLastStep es true solo en el paso 4', () => {
      const { service } = setup({ regular: [tuesdayOpen] });
      service.selectService('s1');
      service.nextStep();
      service.selectedDate.set('2026-08-04');
      service.nextStep();
      service.name.set('Ana');
      service.clientPhone.set('4423016543');
      service.nextStep();

      expect(service.isLastStep()).toBe(true);
    });
  });
});
