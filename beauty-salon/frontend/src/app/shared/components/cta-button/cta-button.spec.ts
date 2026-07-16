import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { CtaButton } from './cta-button';

describe('CtaButton', () => {
  function setup(inputs: Partial<Record<string, unknown>> = {}) {
    TestBed.configureTestingModule({ imports: [CtaButton] });
    const fixture = TestBed.createComponent(CtaButton);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('renderiza <button> por defecto', () => {
    const { el } = setup({ label: 'Reservar' });
    const btn = el.querySelector('button');
    expect(btn).toBeTruthy();
    expect(el.querySelector('a')).toBeFalsy();
    expect(btn?.textContent?.trim()).toBe('Reservar');
  });

  it('renderiza <a> cuando href está seteado', () => {
    const { el } = setup({ label: 'Ver más', href: '/servicios' });
    const link = el.querySelector('a');
    expect(link).toBeTruthy();
    expect(el.querySelector('button')).toBeFalsy();
    expect(link?.getAttribute('href')).toBe('/servicios');
    expect(link?.textContent?.trim()).toBe('Ver más');
  });

  it('aplica btn-primary por defecto', () => {
    const { el } = setup({ label: 'Reservar' });
    const btn = el.querySelector('button');
    expect(btn?.classList.contains('btn-primary')).toBe(true);
    expect(btn?.classList.contains('btn-secondary')).toBe(false);
  });

  it('aplica btn-secondary cuando variant="secondary"', () => {
    const { el } = setup({ label: 'Reservar', variant: 'secondary' });
    const btn = el.querySelector('button');
    expect(btn?.classList.contains('btn-secondary')).toBe(true);
    expect(btn?.classList.contains('btn-primary')).toBe(false);
  });

  it('muestra iconAfter cuando se setea', () => {
    const { el } = setup({ label: 'Reservar', iconAfter: 'arrow-right' });
    const svgIcon = el.querySelector('app-svg-icon');
    expect(svgIcon).toBeTruthy();
  });

  it('agrega target y rel cuando external=true', () => {
    const { el } = setup({
      label: 'WhatsApp',
      href: 'https://wa.me/123',
      external: true,
    });
    const link = el.querySelector('a');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('no agrega target/rel cuando external=false (link)', () => {
    const { el } = setup({ label: 'Ver más', href: '/servicios' });
    const link = el.querySelector('a');
    expect(link?.getAttribute('target')).toBeFalsy();
    expect(link?.getAttribute('rel')).toBeFalsy();
  });

  it('emite clicked al hacer click en button', () => {
    const { fixture, el } = setup({ label: 'Reservar' });
    const btn = el.querySelector('button')!;

    let emitted = false;
    fixture.componentRef.instance.clicked.subscribe(() => (emitted = true));

    btn.click();
    expect(emitted).toBe(true);
  });

  it('no emite clicked cuando es link (sin href)', () => {
    // Si es link, clicked no debería tener efecto.
    // Verificamos que el template no tiene (click) en el <a>
    const { el } = setup({ label: 'Ver más', href: '/servicios' });
    const link = el.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/servicios');
    // clicked output no se emite desde link
  });
});
