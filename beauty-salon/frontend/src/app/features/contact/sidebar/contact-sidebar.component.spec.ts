import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ContactSidebarComponent, SidebarScheduleDay } from './contact-sidebar.component';

const schedule: readonly SidebarScheduleDay[] = [
  { day: 'monday', label: 'Lunes', hours: '09:00 – 19:00', isClosed: false },
  { day: 'sunday', label: 'Domingo', hours: 'Cerrado', isClosed: true },
];

function setup(inputs: Record<string, unknown> = {}) {
  TestBed.configureTestingModule({ imports: [ContactSidebarComponent] });
  const fixture = TestBed.createComponent(ContactSidebarComponent);
  for (const [key, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(key, value);
  }
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

const baseInputs = {
  address: 'Av. Siempre Viva 123, Querétaro',
  phone: '442 301 6543',
  email: 'info@bellezaestilo.com',
  businessHours: schedule,
  isOpenNow: true,
};

describe('ContactSidebarComponent', () => {
  it('renderiza dirección, teléfono y email', () => {
    const { el } = setup(baseInputs);
    expect(el.textContent).toContain('Av. Siempre Viva 123, Querétaro');
    expect(el.textContent).toContain('442 301 6543');
    expect(el.textContent).toContain('info@bellezaestilo.com');
  });

  it('conserva los links hardcodeados de tel/mail', () => {
    const { el } = setup(baseInputs);
    const phoneLink = el.querySelector<HTMLAnchorElement>('a[href="tel:+525512345678"]');
    const mailLink = el.querySelector<HTMLAnchorElement>('a[href="mailto:info@bellezaestilo.com"]');
    expect(phoneLink?.textContent?.trim()).toBe('442 301 6543');
    expect(mailLink).toBeTruthy();
  });

  it('renderiza una fila de horario por día con la clase is-closed cuando corresponde', () => {
    const { el } = setup(baseInputs);
    const rows = el.querySelectorAll('.schedule-row');
    expect(rows.length).toBe(2);
    const closedHours = el.querySelector<HTMLElement>('.schedule-hours.is-closed');
    expect(closedHours?.textContent?.trim()).toBe('Cerrado');
  });

  it('muestra "Abierto ahora" con aria-live cuando isOpenNow', () => {
    const { el } = setup(baseInputs);
    const status = el.querySelector<HTMLElement>('.schedule-status')!;
    expect(status.getAttribute('aria-live')).toBe('polite');
    expect(status.getAttribute('aria-atomic')).toBe('true');
    expect(status.classList.contains('is-open')).toBe(true);
    expect(status.textContent).toContain('Abierto ahora');
  });

  it('muestra "Cerrado" cuando no está abierto', () => {
    const { el } = setup({ ...baseInputs, isOpenNow: false });
    const status = el.querySelector<HTMLElement>('.schedule-status')!;
    expect(status.classList.contains('is-closed')).toBe(true);
    expect(status.textContent).toContain('Cerrado');
  });

  it('renderiza los links sociales con sus labels', () => {
    const { el } = setup(baseInputs);
    const socials = [...el.querySelectorAll<HTMLAnchorElement>('.social-icon')];
    expect(socials.map((s) => s.getAttribute('aria-label'))).toEqual([
      'Instagram',
      'Facebook',
      'WhatsApp',
    ]);
  });

  it('renderiza la CTA de WhatsApp con el link hardcodeado', () => {
    const { el } = setup(baseInputs);
    const cta = el.querySelector<HTMLAnchorElement>('.whatsapp-cta')!;
    expect(cta.getAttribute('href')).toBe('https://wa.me/525512345678');
    expect(cta.getAttribute('target')).toBe('_blank');
    expect(cta.textContent).toContain('Escríbenos por WhatsApp');
  });

  it('no renderiza filas de horario cuando businessHours es undefined', () => {
    const { el } = setup({ ...baseInputs, businessHours: undefined });
    expect(el.querySelectorAll('.schedule-row').length).toBe(0);
  });
});
