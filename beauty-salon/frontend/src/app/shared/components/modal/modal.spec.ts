import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';

describe('Modal', () => {
  function setup(open: boolean, ariaLabel?: string) {
    TestBed.configureTestingModule({ imports: [Modal] });
    const fixture = TestBed.createComponent(Modal);
    fixture.componentRef.setInput('open', open);
    if (ariaLabel !== undefined) {
      fixture.componentRef.setInput('ariaLabel', ariaLabel);
    }
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('no renderiza nada cuando open=false', () => {
    const { el } = setup(false);
    const backdrop = el.querySelector('.modal-backdrop');
    expect(backdrop).toBeFalsy();
  });

  it('renderiza backdrop y panel cuando open=true', () => {
    const { el } = setup(true);
    const backdrop = el.querySelector('.modal-backdrop');
    expect(backdrop).toBeTruthy();
    expect(backdrop?.getAttribute('role')).toBe('dialog');
    expect(backdrop?.getAttribute('aria-modal')).toBe('true');

    const panel = el.querySelector('.modal-panel');
    expect(panel).toBeTruthy();

    const closeBtn = el.querySelector('.modal-close');
    expect(closeBtn).toBeTruthy();
  });

  it('setea aria-label en el dialog cuando se provee', () => {
    const { el } = setup(true, 'Confirmar turno');
    const backdrop = el.querySelector('.modal-backdrop');
    expect(backdrop?.getAttribute('aria-label')).toBe('Confirmar turno');
  });

  it('no setea aria-label cuando no se provee', () => {
    const { el } = setup(true);
    const backdrop = el.querySelector('.modal-backdrop');
    expect(backdrop?.hasAttribute('aria-label')).toBe(false);
  });

  it('emite close al hacer click en el backdrop', () => {
    const { fixture, el } = setup(true);
    const backdrop = el.querySelector<HTMLElement>('.modal-backdrop')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    backdrop.click();
    expect(emitted).toBe(true);
  });

  it('emite close al presionar Escape', () => {
    const { fixture, el } = setup(true);
    const backdrop = el.querySelector<HTMLElement>('.modal-backdrop')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emitted).toBe(true);
  });

  it('no emite close al presionar otra tecla', () => {
    const { fixture, el } = setup(true);
    const backdrop = el.querySelector<HTMLElement>('.modal-backdrop')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(emitted).toBe(false);
  });

  it('emite close al hacer click en boton cerrar', () => {
    const { fixture, el } = setup(true);
    const closeBtn = el.querySelector<HTMLElement>('.modal-close')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    closeBtn.click();
    expect(emitted).toBe(true);
  });

  it('no emite close al hacer click dentro del panel', () => {
    const { fixture, el } = setup(true);
    const panel = el.querySelector<HTMLElement>('.modal-panel')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    panel.click();
    expect(emitted).toBe(false);
  });
});
