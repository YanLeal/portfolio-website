import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Modal } from './modal';

describe('Modal', () => {
  function setup(
    open: boolean,
    overrides?: {
      ariaLabel?: string;
      size?: string;
      closeLabel?: string;
      title?: string;
      closable?: boolean;
      persistent?: boolean;
      fullscreen?: boolean;
    },
  ) {
    TestBed.configureTestingModule({ imports: [Modal] });
    const fixture = TestBed.createComponent(Modal);
    const component = fixture.componentRef.instance;

    fixture.componentRef.setInput('open', open);
    if (overrides?.ariaLabel !== undefined) fixture.componentRef.setInput('ariaLabel', overrides.ariaLabel);
    if (overrides?.size !== undefined) fixture.componentRef.setInput('size', overrides.size);
    if (overrides?.closeLabel !== undefined) fixture.componentRef.setInput('closeLabel', overrides.closeLabel);
    if (overrides?.title !== undefined) fixture.componentRef.setInput('title', overrides.title);
    if (overrides?.closable !== undefined) fixture.componentRef.setInput('closable', overrides.closable);
    if (overrides?.persistent !== undefined) fixture.componentRef.setInput('persistent', overrides.persistent);
    if (overrides?.fullscreen !== undefined) fixture.componentRef.setInput('fullscreen', overrides.fullscreen);

    fixture.detectChanges();
    return { fixture, component, el: fixture.nativeElement as HTMLElement };
  }

  // ── Render ───────────────────────────────────────────────────

  it('no renderiza nada cuando open=false', () => {
    const { el } = setup(false);
    expect(el.querySelector('.modal-backdrop')).toBeFalsy();
  });

  it('renderiza backdrop y panel cuando open=true', () => {
    const { el } = setup(true);
    expect(el.querySelector('.modal-backdrop')).toBeTruthy();
    expect(el.querySelector('.modal-panel')).toBeTruthy();
    expect(el.querySelector('.modal-body')).toBeTruthy();
  });

  it('tiene la clase app-modal en el host', () => {
    const { el } = setup(true);
    expect(el.classList.contains('app-modal')).toBe(true);
  });

  // ── Title ────────────────────────────────────────────────────

  it('renderiza el titulo en un h2 cuando se provee', () => {
    const { el } = setup(true, { title: 'Confirmar' });
    const h2 = el.querySelector('.modal-title');
    expect(h2).toBeTruthy();
    expect(h2?.textContent).toBe('Confirmar');
  });

  it('no renderiza el header cuando no hay titulo', () => {
    const { el } = setup(true);
    expect(el.querySelector('.modal-header')).toBeFalsy();
  });

  it('asigna id al h2 del titulo para aria-labelledby', () => {
    const { el } = setup(true, { title: 'Test' });
    const h2 = el.querySelector<HTMLElement>('.modal-title');
    expect(h2?.id).toMatch(/^modal-title-/);
  });

  it('vincula aria-labelledby al titulo', () => {
    const { el } = setup(true, { title: 'Test' });
    const backdrop = el.querySelector('.modal-backdrop');
    const h2 = el.querySelector<HTMLElement>('.modal-title');
    expect(backdrop?.getAttribute('aria-labelledby')).toBe(h2?.id);
  });

  it('no setea aria-labelledby cuando no hay titulo', () => {
    const { el } = setup(true);
    expect(el.querySelector('.modal-backdrop')?.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('setea aria-label como fallback cuando no hay titulo', () => {
    const { el } = setup(true, { ariaLabel: 'Confirmar turno' });
    expect(el.querySelector('.modal-backdrop')?.getAttribute('aria-label')).toBe('Confirmar turno');
  });

  it('no setea aria-label cuando hay titulo', () => {
    const { el } = setup(true, { title: 'Hola', ariaLabel: 'fallback' });
    // aria-labelledby should be used instead, aria-label should be null
    expect(el.querySelector('.modal-backdrop')?.hasAttribute('aria-label')).toBe(false);
  });

  // ── Closable ─────────────────────────────────────────────────

  it('muestra el boton cerrar por defecto', () => {
    const { el } = setup(true);
    expect(el.querySelector('.modal-close')).toBeTruthy();
  });

  it('oculta el boton cerrar cuando closable=false', () => {
    const { el } = setup(true, { closable: false });
    expect(el.querySelector('.modal-close')).toBeFalsy();
  });

  it('posiciona el close absolutamente cuando no hay titulo', () => {
    const { el } = setup(true);
    const btn = el.querySelector('.modal-close');
    expect(btn?.classList.contains('modal-close--standalone')).toBe(true);
  });

  it('posiciona el close en el header cuando hay titulo', () => {
    const { el } = setup(true, { title: 'Título' });
    const btn = el.querySelector('.modal-close');
    expect(btn?.classList.contains('modal-close--standalone')).toBe(false);
  });

  // ── Size ─────────────────────────────────────────────────────

  it('setea data-size en el backdrop', () => {
    const { el } = setup(true, { size: 'lg' });
    expect(el.querySelector('.modal-backdrop')?.getAttribute('data-size')).toBe('lg');
  });

  it('usa "md" como tamaño default', () => {
    const { el } = setup(true);
    expect(el.querySelector('.modal-backdrop')?.getAttribute('data-size')).toBe('md');
  });

  // ── Fullscreen ───────────────────────────────────────────────

  it('setea data-fullscreen cuando fullscreen=true', () => {
    const { el } = setup(true, { fullscreen: true });
    expect(el.querySelector('.modal-backdrop')?.hasAttribute('data-fullscreen')).toBe(true);
  });

  it('no setea data-fullscreen cuando fullscreen=false', () => {
    const { el } = setup(true);
    expect(el.querySelector('.modal-backdrop')?.hasAttribute('data-fullscreen')).toBe(false);
  });

  // ── Close button label ───────────────────────────────────────

  it('setea aria-label en el boton cerrar desde closeLabel', () => {
    const { el } = setup(true, { closeLabel: 'Fechar' });
    expect(el.querySelector('.modal-close')?.getAttribute('aria-label')).toBe('Fechar');
  });

  it('usa "Cerrar" como closeLabel default', () => {
    const { el } = setup(true);
    expect(el.querySelector('.modal-close')?.getAttribute('aria-label')).toBe('Cerrar');
  });

  // ── Body scroll lock ─────────────────────────────────────────

  it('bloquea scroll del body cuando open=true', () => {
    setup(true);
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('restaura scroll del body cuando open=false', () => {
    const { fixture } = setup(true);
    expect(document.body.style.overflow).toBe('hidden');

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('');
  });

  // ── Close events (default) ───────────────────────────────────

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

  // ── Persistent ───────────────────────────────────────────────

  it('no emite close al hacer click en backdrop cuando persistent=true', () => {
    const { fixture, el } = setup(true, { persistent: true });
    const backdrop = el.querySelector<HTMLElement>('.modal-backdrop')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    backdrop.click();
    expect(emitted).toBe(false);
  });

  it('no emite close al presionar Escape cuando persistent=true', () => {
    const { fixture, el } = setup(true, { persistent: true });
    const backdrop = el.querySelector<HTMLElement>('.modal-backdrop')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(emitted).toBe(false);
  });

  it('emite close al hacer click en boton cerrar aunque persistent=true', () => {
    const { fixture, el } = setup(true, { persistent: true });
    const closeBtn = el.querySelector<HTMLElement>('.modal-close')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    closeBtn.click();
    expect(emitted).toBe(true);
  });

  // ── Focus restoration ────────────────────────────────────────

  it('restaura el foco al elemento que abrio el modal', () => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    expect(document.activeElement).toBe(button);

    const { fixture } = setup(true);

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    expect(document.activeElement).toBe(button);
    document.body.removeChild(button);
  });

  // ── Focus trap ───────────────────────────────────────────────

  it('no cierra al hacer Tab en el panel (focus trap activo)', () => {
    const { fixture, el } = setup(true);
    const backdrop = el.querySelector<HTMLElement>('.modal-backdrop')!;

    let emitted = false;
    fixture.componentRef.instance.close.subscribe(() => (emitted = true));

    backdrop.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(emitted).toBe(false);
  });
});
