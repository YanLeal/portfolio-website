import { describe, it, expect, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Carousel } from './carousel';
import { CarouselController } from '../../utils/carousel-controller';

function createMockController(overrides: Partial<CarouselController> = {}): CarouselController {
  const mock = {
    currentIndex: signal(0),
    isFirst: signal(true),
    isLast: signal(false),
    translateX: signal('translateX(0)'),
    goTo: vi.fn(),
    previous: vi.fn(),
    next: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    ...overrides,
  } as unknown as CarouselController;
  return mock;
}

describe('Carousel', () => {
  function setup(
    controller: CarouselController,
    inputs: Partial<Record<string, unknown>> = {},
  ) {
    TestBed.configureTestingModule({ imports: [Carousel] });
    const fixture = TestBed.createComponent(Carousel);
    fixture.componentRef.setInput('controller', controller);
    fixture.componentRef.setInput('totalItems', 3);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  describe('navegación', () => {
    it('handleDotClick llama a controller.goTo cuando no hay handler custom', () => {
      const ctrl = createMockController();
      const { fixture } = setup(ctrl);

      fixture.componentRef.instance.handleDotClick(2);
      expect(ctrl.goTo).toHaveBeenCalledWith(2);
    });

    it('handleDotClick llama al handler custom cuando existe', () => {
      const ctrl = createMockController();
      const customHandler = vi.fn();
      const { fixture } = setup(ctrl, { onDotClick: customHandler });

      fixture.componentRef.instance.handleDotClick(1);
      expect(customHandler).toHaveBeenCalledWith(1);
      expect(ctrl.goTo).not.toHaveBeenCalled();
    });

    it('handlePrev llama a controller.previous por defecto', () => {
      const ctrl = createMockController();
      const { fixture } = setup(ctrl);

      fixture.componentRef.instance.handlePrev();
      expect(ctrl.previous).toHaveBeenCalledOnce();
    });

    it('handlePrev llama al handler custom cuando existe', () => {
      const ctrl = createMockController();
      const customHandler = vi.fn();
      const { fixture } = setup(ctrl, { onNavPrev: customHandler });

      fixture.componentRef.instance.handlePrev();
      expect(customHandler).toHaveBeenCalledOnce();
      expect(ctrl.previous).not.toHaveBeenCalled();
    });

    it('handleNext llama a controller.next por defecto', () => {
      const ctrl = createMockController();
      const { fixture } = setup(ctrl);

      fixture.componentRef.instance.handleNext();
      expect(ctrl.next).toHaveBeenCalledOnce();
    });

    it('handleNext llama al handler custom cuando existe', () => {
      const ctrl = createMockController();
      const customHandler = vi.fn();
      const { fixture } = setup(ctrl, { onNavNext: customHandler });

      fixture.componentRef.instance.handleNext();
      expect(customHandler).toHaveBeenCalledOnce();
      expect(ctrl.next).not.toHaveBeenCalled();
    });
  });

  describe('renderizado', () => {
    it('renderiza los dots basado en totalItems', () => {
      const ctrl = createMockController();
      const { el } = setup(ctrl, { totalItems: 3 });

      const dots = el.querySelectorAll('.carousel-dot');
      expect(dots.length).toBe(3);
    });

    it('no renderiza dots cuando totalItems <= 1', () => {
      const ctrl = createMockController();
      const { el } = setup(ctrl, { totalItems: 1 });

      const dots = el.querySelectorAll('.carousel-dot');
      expect(dots.length).toBe(0);
    });

    it('marca el dot activo con aria-selected=true', () => {
      const ctrl = createMockController({ currentIndex: signal(1) });
      const { el } = setup(ctrl, { totalItems: 3 });

      const dots = el.querySelectorAll<HTMLButtonElement>('.carousel-dot');
      expect(dots[1].getAttribute('aria-selected')).toBe('true');
      expect(dots[0].getAttribute('aria-selected')).toBe('false');
      expect(dots[2].getAttribute('aria-selected')).toBe('false');
    });

    it('setea aria-label en los dots con itemLabelSingular', () => {
      const ctrl = createMockController();
      const { el } = setup(ctrl, {
        totalItems: 2,
        itemLabelSingular: 'testimonio',
      });

      const dots = el.querySelectorAll<HTMLButtonElement>('.carousel-dot');
      expect(dots[0].getAttribute('aria-label')).toBe('Ir al testimonio 1');
      expect(dots[1].getAttribute('aria-label')).toBe('Ir al testimonio 2');
    });

    it('renderiza boton prev/next cuando no está en bounds y hideNavOnBounds=true', () => {
      const ctrl = createMockController({
        isFirst: signal(false),
        isLast: signal(false),
      });
      const { el } = setup(ctrl);

      expect(el.querySelector('.carousel-btn--prev')).toBeTruthy();
      expect(el.querySelector('.carousel-btn--next')).toBeTruthy();
    });

    it('oculta boton prev cuando isFirst=true y hideNavOnBounds=true', () => {
      const ctrl = createMockController({
        isFirst: signal(true),
        isLast: signal(false),
      });
      const { el } = setup(ctrl);

      expect(el.querySelector('.carousel-btn--prev')).toBeFalsy();
      expect(el.querySelector('.carousel-btn--next')).toBeTruthy();
    });

    it('oculta boton next cuando isLast=true y hideNavOnBounds=true', () => {
      const ctrl = createMockController({
        isFirst: signal(false),
        isLast: signal(true),
      });
      const { el } = setup(ctrl);

      expect(el.querySelector('.carousel-btn--prev')).toBeTruthy();
      expect(el.querySelector('.carousel-btn--next')).toBeFalsy();
    });

    it('muestra boton prev aun en first cuando hideNavOnBounds=false', () => {
      const ctrl = createMockController({
        isFirst: signal(true),
        isLast: signal(false),
      });
      const { el } = setup(ctrl, { hideNavOnBounds: false });

      expect(el.querySelector('.carousel-btn--prev')).toBeTruthy();
    });

    it('setea aria-label en el carrusel usando ariaLabel input', () => {
      const ctrl = createMockController();
      const { el } = setup(ctrl, { ariaLabel: 'Testimonios' });

      const carousel = el.querySelector('.carousel');
      expect(carousel?.getAttribute('aria-label')).toBe('Testimonios');
    });

    it('aplica clase carousel-track--instant cuando animateTrack=false', () => {
      const ctrl = createMockController();
      const { el } = setup(ctrl, { animateTrack: false });

      const track = el.querySelector('.carousel-track');
      expect(track?.classList.contains('carousel-track--instant')).toBe(true);
    });

    it('setea tabindex=-1 en botones cuando zoomActive=true', () => {
      const ctrl = createMockController({
        isFirst: signal(false),
        isLast: signal(false),
      });
      const { el } = setup(ctrl, { zoomActive: true });

      const prev = el.querySelector('.carousel-btn--prev');
      const next = el.querySelector('.carousel-btn--next');
      expect(prev?.getAttribute('tabindex')).toBe('-1');
      expect(next?.getAttribute('tabindex')).toBe('-1');
    });

    it('aria-hidden=true en botones y dots cuando zoomActive=true', () => {
      const ctrl = createMockController({
        isFirst: signal(false),
        isLast: signal(false),
      });
      const { el } = setup(ctrl, { zoomActive: true });

      const dots = el.querySelector('.carousel-dots');
      expect(dots?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('makeIndexArray', () => {
    it('genera array de indices [0..length-1]', () => {
      TestBed.configureTestingModule({ imports: [Carousel] });
      const fixture = TestBed.createComponent(Carousel);
      const inst = fixture.componentRef.instance;

      expect(inst.makeIndexArray(3)).toEqual([0, 1, 2]);
      expect(inst.makeIndexArray(0)).toEqual([]);
      expect(inst.makeIndexArray(1)).toEqual([0]);
    });
  });
});
