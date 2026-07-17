import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Tooltip } from './tooltip';
import type { TooltipPosition } from './tooltip.types';

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function setup(overrides?: { text?: string; position?: TooltipPosition; delay?: number; disabled?: boolean }) {
    TestBed.configureTestingModule({ imports: [Tooltip] });
    const fixture = TestBed.createComponent(Tooltip);
    const component = fixture.componentRef.instance;

    fixture.componentRef.setInput('text', overrides?.text ?? 'Ayuda');
    if (overrides?.position !== undefined) fixture.componentRef.setInput('position', overrides.position);
    if (overrides?.delay !== undefined) fixture.componentRef.setInput('delay', overrides.delay);
    if (overrides?.disabled !== undefined) fixture.componentRef.setInput('disabled', overrides.disabled);

    fixture.detectChanges();
    return { fixture, component, el: fixture.nativeElement as HTMLElement };
  }

  // ── Render ───────────────────────────────────────────────────

  it('renderiza el trigger y el tooltip siempre en el DOM', () => {
    const { el } = setup();
    expect(el.querySelector('.tooltip-trigger')).toBeTruthy();
    expect(el.querySelector('.tooltip')).toBeTruthy();
    expect(el.querySelector('.tooltip-text')?.textContent).toBe('Ayuda');
  });

  it('tiene clase app-tooltip en el host', () => {
    const { el } = setup();
    expect(el.classList.contains('app-tooltip')).toBe(true);
  });

  // ── ARIA ─────────────────────────────────────────────────────

  it('setea aria-describedby en el trigger', () => {
    const { el } = setup();
    const trigger = el.querySelector('.tooltip-trigger');
    const tooltip = el.querySelector('.tooltip');
    expect(trigger?.getAttribute('aria-describedby')).toBe(tooltip?.id);
  });

  it('tiene role="tooltip"', () => {
    const { el } = setup();
    expect(el.querySelector('.tooltip')?.getAttribute('role')).toBe('tooltip');
  });

  // ── Visibilidad ──────────────────────────────────────────────

  it('tooltip oculto por defecto', () => {
    const { el } = setup();
    const tooltip = el.querySelector('.tooltip');
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(false);
  });

  it('muestra el tooltip despues del delay al hacer mouseenter', () => {
    const { fixture, el } = setup({ delay: 300 });
    const trigger = el.querySelector<HTMLElement>('.tooltip-trigger')!;
    const tooltip = el.querySelector('.tooltip');

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(false);

    vi.advanceTimersByTime(300);
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(true);
  });

  it('oculta el tooltip al hacer mouseleave', () => {
    const { fixture, el } = setup({ delay: 100 });
    const trigger = el.querySelector<HTMLElement>('.tooltip-trigger')!;
    const tooltip = el.querySelector('.tooltip');

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(true);

    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(false);
  });

  it('no muestra el tooltip si disabled=true', () => {
    const { fixture, el } = setup({ delay: 50, disabled: true });
    const trigger = el.querySelector<HTMLElement>('.tooltip-trigger')!;
    const tooltip = el.querySelector('.tooltip');

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(200);
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(false);
  });

  it('cancela el delay si el mouse sale antes del timeout', () => {
    const { fixture, el } = setup({ delay: 200 });
    const trigger = el.querySelector<HTMLElement>('.tooltip-trigger')!;
    const tooltip = el.querySelector('.tooltip');

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    trigger.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(200);
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(false);
  });

  // ── Position ─────────────────────────────────────────────────

  it('usa "top" como posicion default', () => {
    const { el } = setup();
    expect(el.querySelector('.tooltip')?.getAttribute('data-position')).toBe('top');
  });

  it.each([
    ['top' as TooltipPosition],
    ['bottom' as TooltipPosition],
    ['left' as TooltipPosition],
    ['right' as TooltipPosition],
  ])('setea data-position=%s desde el input', (pos) => {
    const { el } = setup({ position: pos });
    expect(el.querySelector('.tooltip')?.getAttribute('data-position')).toBe(pos);
  });

  // ── Escape ───────────────────────────────────────────────────

  it('oculta el tooltip al presionar Escape', () => {
    const { fixture, el } = setup({ delay: 50 });
    const trigger = el.querySelector<HTMLElement>('.tooltip-trigger')!;
    const tooltip = el.querySelector('.tooltip');

    trigger.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(50);
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(true);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(false);
  });

  // ── Focus ────────────────────────────────────────────────────

  it('muestra el tooltip al recibir foco', () => {
    const { fixture, el } = setup({ delay: 100 });
    const trigger = el.querySelector<HTMLElement>('.tooltip-trigger')!;
    const tooltip = el.querySelector('.tooltip');

    trigger.dispatchEvent(new FocusEvent('focusin'));
    vi.advanceTimersByTime(100);
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(true);
  });

  it('oculta el tooltip al perder foco', () => {
    const { fixture, el } = setup({ delay: 50 });
    const trigger = el.querySelector<HTMLElement>('.tooltip-trigger')!;
    const tooltip = el.querySelector('.tooltip');

    trigger.dispatchEvent(new FocusEvent('focusin'));
    vi.advanceTimersByTime(50);
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(true);

    trigger.dispatchEvent(new FocusEvent('focusout'));
    fixture.detectChanges();
    expect(tooltip?.classList.contains('tooltip--visible')).toBe(false);
  });

  // ── ng-content ───────────────────────────────────────────────

  it('proyecta contenido en el trigger', () => {
    const { el } = setup();
    const trigger = el.querySelector('.tooltip-trigger')!;
    const btn = document.createElement('button');
    btn.textContent = 'Click';
    trigger.insertBefore(btn, trigger.querySelector('.tooltip'));
    expect(trigger.textContent).toContain('Click');
  });
});
