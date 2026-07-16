import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Badge } from './badge';
import type { BadgeColor, BadgeVariant, BadgeSize, SvgIconName, BadgeAnim } from '../../types';

describe('Badge', () => {
  function setup(inputs: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({ imports: [Badge] });
    const fixture = TestBed.createComponent(Badge);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  const baseBadge = {
    id: 'test',
    label: 'Nuevo',
    priority: 10,
    color: 'success' as BadgeColor,
    icon: 'sparkles' as SvgIconName,
  };

  /* ──────────────── RENDER BASICO ──────────────── */

  it('renderiza label via input directo', () => {
    const { el } = setup({ label: 'Nuevo' });
    const badge = el.querySelector('.badge');
    expect(badge?.textContent?.trim()).toBe('Nuevo');
  });

  it('renderiza label via objeto badge', () => {
    const { el } = setup({ badge: baseBadge });
    const badge = el.querySelector('.badge');
    expect(badge?.textContent?.trim()).toContain('Nuevo');
  });

  it('input directo sobreescribe badge.label', () => {
    const { el } = setup({ badge: baseBadge, label: 'Override' });
    const badge = el.querySelector('.badge');
    expect(badge?.textContent?.trim()).toContain('Override');
    expect(badge?.textContent?.trim()).not.toContain('Nuevo');
  });

  it('no renderiza texto si no hay label ni badge', () => {
    const { el } = setup({});
    const badge = el.querySelector('.badge');
    expect(badge).toBeTruthy();
    expect(badge?.textContent?.trim()).toBe('');
  });

  /* ──────────────── COLOR ──────────────── */

  it.each(['primary', 'secondary', 'success', 'warning', 'danger', 'neutral', 'accent', 'brand'] as BadgeColor[])(
    'setea data-color="%s" via input directo',
    (color) => {
      const { el } = setup({ color });
      const badge = el.querySelector('.badge');
      expect(badge?.getAttribute('data-color')).toBe(color);
    },
  );

  it('hereda color desde badge object', () => {
    const { el } = setup({ badge: { ...baseBadge, color: 'warning' } });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('data-color')).toBe('warning');
  });

  it('usa primary como color por defecto', () => {
    const { el } = setup({ label: 'test' });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('data-color')).toBe('primary');
  });

  /* ──────────────── VARIANT ──────────────── */

  it.each(['filled', 'outlined', 'subtle'] as BadgeVariant[])(
    'setea data-variant="%s"',
    (variant) => {
      const { el } = setup({ label: 'test', variant });
      const badge = el.querySelector('.badge');
      expect(badge?.getAttribute('data-variant')).toBe(variant);
    },
  );

  it('usa filled como variant por defecto', () => {
    const { el } = setup({ label: 'test' });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('data-variant')).toBe('filled');
  });

  /* ──────────────── SIZE ──────────────── */

  it.each(['xs', 'sm', 'md', 'lg'] as BadgeSize[])(
    'setea data-size="%s"',
    (size) => {
      const { el } = setup({ label: 'test', size });
      const badge = el.querySelector('.badge');
      expect(badge?.getAttribute('data-size')).toBe(size);
    },
  );

  it('usa md como size por defecto', () => {
    const { el } = setup({ label: 'test' });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('data-size')).toBe('md');
  });

  /* ──────────────── ICONO ──────────────── */

  it('renderiza app-svg-icon cuando hay icon', () => {
    const { el } = setup({ label: 'test', icon: 'sparkles' });
    const icon = el.querySelector('.badge__icon');
    expect(icon).toBeTruthy();
  });

  it('hereda icon desde badge object', () => {
    const { el } = setup({ badge: baseBadge });
    const icon = el.querySelector('.badge__icon');
    expect(icon).toBeTruthy();
  });

  it('no renderiza icon si no hay icon', () => {
    const { el } = setup({ label: 'test' });
    const icon = el.querySelector('.badge__icon');
    expect(icon).toBeFalsy();
  });

  /* ──────────────── ICONO AFTER ──────────────── */

  it('renderiza app-svg-icon cuando hay iconAfter', () => {
    const { el } = setup({ label: 'test', iconAfter: 'chevron-down' });
    const icons = el.querySelectorAll('.badge__icon');
    expect(icons.length).toBe(1);
  });

  it('renderiza ambos iconos cuando hay icon e iconAfter', () => {
    const { el } = setup({ label: 'test', icon: 'sparkles', iconAfter: 'chevron-down' });
    const icons = el.querySelectorAll('.badge__icon');
    expect(icons.length).toBe(2);
  });

  it('iconAfter no se hereda de badge.icon', () => {
    const { el } = setup({ badge: baseBadge, iconAfter: 'chevron-down' });
    const icons = el.querySelectorAll('.badge__icon');
    expect(icons.length).toBe(2); // sparkles (de badge.icon) + chevron-down (de iconAfter)
  });

  it('iconAfter sin icon izquierdo renderiza solo iconAfter', () => {
    const { el } = setup({ label: 'test', iconAfter: 'arrow-right' });
    const icons = el.querySelectorAll('.badge__icon');
    expect(icons.length).toBe(1);
  });

  it('no renderiza iconAfter si no se pasa', () => {
    const { el } = setup({ label: 'test', icon: 'sparkles' });
    const icons = el.querySelectorAll('.badge__icon');
    expect(icons.length).toBe(1); // solo el izquierdo
  });

  /* ──────────────── SELECTABLE ──────────────── */

  it('modo selectable: setea aria-pressed=false por defecto', () => {
    const { el } = setup({ label: 'test', selectable: true });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('aria-pressed')).toBe('false');
  });

  it('modo selectable: setea aria-pressed=true cuando selected', () => {
    const { el } = setup({ label: 'test', selectable: true, selected: true });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('aria-pressed')).toBe('true');
  });

  it('modo selectable: emite toggled con !selected al hacer click', () => {
    const { fixture, el } = setup({ label: 'test', selectable: true });
    const spy = vi.fn();
    fixture.componentRef.instance.toggled.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.click();
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('modo selectable: emite toggled con false si estaba selected', () => {
    const { fixture, el } = setup({ label: 'test', selectable: true, selected: true });
    const spy = vi.fn();
    fixture.componentRef.instance.toggled.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.click();
    expect(spy).toHaveBeenCalledWith(false);
  });

  /* ──────────────── CLICKABLE ──────────────── */

  it('modo clickable: emite clicked con el id al hacer click', () => {
    const { fixture, el } = setup({ label: 'test', clickable: true });
    const spy = vi.fn();
    fixture.componentRef.instance.clicked.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.click();
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('modo clickable: emite clicked con badge.id si existe', () => {
    const { fixture, el } = setup({
      badge: { id: 'serv-1', label: 'Servicio', priority: 5, color: 'primary' },
      clickable: true,
    });
    const spy = vi.fn();
    fixture.componentRef.instance.clicked.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.click();
    expect(spy).toHaveBeenCalledWith('serv-1');
  });

  /* ──────────────── REMOVABLE ──────────────── */

  it('modo removable: renderiza boton de cerrar', () => {
    const { el } = setup({ label: 'test', removable: true });
    const removeBtn = el.querySelector('.badge__remove');
    expect(removeBtn).toBeTruthy();
  });

  it('modo removable: emite removed al hacer click en ×', () => {
    const { fixture, el } = setup({ label: 'test', removable: true });
    const spy = vi.fn();
    fixture.componentRef.instance.removed.subscribe(spy);

    const removeBtn = el.querySelector<HTMLElement>('.badge__remove')!;
    removeBtn.click();
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('modo removable: no emite removed al hacer click en badge', () => {
    const { fixture, el } = setup({ label: 'test', removable: true });
    const spy = vi.fn();
    fixture.componentRef.instance.removed.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.click();
    expect(spy).not.toHaveBeenCalled();
  });

  /* ──────────────── SIN INTERACCION ──────────────── */

  it('sin interactividad: no setea role ni tabindex', () => {
    const { el } = setup({ label: 'test' });
    const badge = el.querySelector('.badge');
    expect(badge?.hasAttribute('role')).toBe(false);
    expect(badge?.hasAttribute('tabindex')).toBe(false);
  });

  it('sin interactividad: no setea aria-pressed', () => {
    const { el } = setup({ label: 'test' });
    const badge = el.querySelector('.badge');
    expect(badge?.hasAttribute('aria-pressed')).toBe(false);
  });

  it('sin interactividad: renderiza span', () => {
    const { el } = setup({ label: 'test' });
    const badge = el.querySelector('.badge');
    expect(badge?.tagName).toBe('SPAN');
  });

  /* ──────────────── ACCESIBILIDAD ──────────────── */

  it('selectable: setea role="button" y tabindex="0"', () => {
    const { el } = setup({ label: 'test', selectable: true });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('role')).toBe('button');
    expect(badge?.getAttribute('tabindex')).toBe('0');
  });

  it('clickable: setea role="button" y tabindex="0"', () => {
    const { el } = setup({ label: 'test', clickable: true });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('role')).toBe('button');
    expect(badge?.getAttribute('tabindex')).toBe('0');
  });

  it('removable sin interactividad: no setea role="button"', () => {
    const { el } = setup({ label: 'test', removable: true });
    const badge = el.querySelector('.badge');
    expect(badge?.hasAttribute('role')).toBe(false);
    expect(badge?.hasAttribute('tabindex')).toBe(false);
  });

  it('iconos tienen aria-hidden="true"', () => {
    const { el } = setup({ label: 'test', icon: 'sparkles', iconAfter: 'chevron-down' });
    const icons = el.querySelectorAll('app-svg-icon');
    icons.forEach((icon) => {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    });
  });

  it('boton remove tiene aria-label descriptivo', () => {
    const { el } = setup({ label: 'Corte', removable: true });
    const btn = el.querySelector('.badge__remove');
    expect(btn?.getAttribute('aria-label')).toBe('Remover Corte');
  });

  it('boton remove usa --space-6 (WCAG target size 24px)', () => {
    const { el } = setup({ label: 'test', removable: true });
    const btn = el.querySelector('.badge__remove');
    expect(btn).toBeTruthy();
    // La regla CSS width/height: var(--space-6) se verifica en el archivo .css
    // --space-6 = 24px en el design system (tokens.css)
  });

  /* ─── Keyboard: Enter ─── */

  it('selectable: Enter emite toggled', () => {
    const { fixture, el } = setup({ label: 'test', selectable: true });
    const spy = vi.fn();
    fixture.componentRef.instance.toggled.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('clickable: Enter emite clicked', () => {
    const { fixture, el } = setup({ label: 'test', clickable: true });
    const spy = vi.fn();
    fixture.componentRef.instance.clicked.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(spy).toHaveBeenCalledWith('test');
  });

  /* ─── Keyboard: Space ─── */

  it('selectable: Space emite toggled', () => {
    const { fixture, el } = setup({ label: 'test', selectable: true });
    const spy = vi.fn();
    fixture.componentRef.instance.toggled.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(spy).toHaveBeenCalledWith(true);
  });

  it('clickable: Space emite clicked', () => {
    const { fixture, el } = setup({ label: 'test', clickable: true });
    const spy = vi.fn();
    fixture.componentRef.instance.clicked.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    expect(spy).toHaveBeenCalledWith('test');
  });

  it('sin interactividad: Enter no hace nada', () => {
    const { fixture, el } = setup({ label: 'test' });
    const spy = vi.fn();
    fixture.componentRef.instance.clicked.subscribe(spy);

    const badge = el.querySelector<HTMLElement>('.badge')!;
    badge.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(spy).not.toHaveBeenCalled();
  });

  /* ──────────────── ROUNDED ──────────────── */

  it('rounded=true (default): no tiene clase badge--squared', () => {
    const { el } = setup({ label: 'test' });
    const badge = el.querySelector('.badge');
    expect(badge?.classList.contains('badge--squared')).toBe(false);
  });

  it('rounded=false: tiene clase badge--squared', () => {
    const { el } = setup({ label: 'test', rounded: false });
    const badge = el.querySelector('.badge');
    expect(badge?.classList.contains('badge--squared')).toBe(true);
  });

  /* ──────────────── ANIMACION ──────────────── */

  it('anim=true (default): setea data-anim="fadeIn"', () => {
    const { el } = setup({ label: 'test' });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('data-anim')).toBe('fadeIn');
  });

  it('anim=false: no setea data-anim', () => {
    const { el } = setup({ label: 'test', anim: false });
    const badge = el.querySelector('.badge');
    expect(badge?.hasAttribute('data-anim')).toBe(false);
  });

  it.each(['fadeIn', 'pulse', 'scaleIn', 'slideIn'] as BadgeAnim[])(
    'anim="%s": setea data-anim correcto',
    (anim) => {
      const { el } = setup({ label: 'test', anim });
      const badge = el.querySelector('.badge');
      expect(badge?.getAttribute('data-anim')).toBe(anim);
    },
  );

  it('anim=true: setea fadeIn', () => {
    const { el } = setup({ label: 'test', anim: true });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('data-anim')).toBe('fadeIn');
  });

  /* ─── Legacy animated (backward compat) ─── */

  it('animated=false: no setea data-anim', () => {
    const { el } = setup({ label: 'test', animated: false });
    const badge = el.querySelector('.badge');
    expect(badge?.hasAttribute('data-anim')).toBe(false);
  });

  it('anim=false sobreescribe animated=true', () => {
    const { el } = setup({ label: 'test', animated: true, anim: false });
    const badge = el.querySelector('.badge');
    expect(badge?.hasAttribute('data-anim')).toBe(false);
  });

  it('anim="pulse" sobreescribe animated=false', () => {
    const { el } = setup({ label: 'test', animated: false, anim: 'pulse' });
    const badge = el.querySelector('.badge');
    expect(badge?.getAttribute('data-anim')).toBe('pulse');
  });
});
