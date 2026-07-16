import { signal, DestroyRef } from '@angular/core';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CarouselController, type CarouselConfig } from './carousel-controller';

interface FakeDestroyRef extends DestroyRef {
  onDestroy: (cb: () => void) => () => void;
  destroyCbs: Array<() => void>;
}

function fakeDestroyRef(): FakeDestroyRef {
  const destroyCbs: Array<() => void> = [];
  return {
    onDestroy: (cb: () => void) => { destroyCbs.push(cb); return cb; },
    destroyCbs,
  } as unknown as FakeDestroyRef;
}

function createCarousel(overrides?: Partial<CarouselConfig>): CarouselController {
  const totalItems = signal(5);
  return new CarouselController({
    totalItems,
    destroyRef: fakeDestroyRef(),
    ...overrides,
  });
}

/** Crea un KeyboardEvent compatible con Node.js (sin DOM global). */
function createKeyEvent(key: string): KeyboardEvent {
  return { key, preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as KeyboardEvent;
}

describe('CarouselController', () => {
  describe('estado inicial', () => {
    it('arranca en el índice 0', () => {
      const c = createCarousel();
      expect(c.currentIndex()).toBe(0);
    });

    it('isFirst es true al inicio', () => {
      const c = createCarousel();
      expect(c.isFirst()).toBe(true);
    });

    it('isLast es false cuando hay más de 1 slide', () => {
      const c = createCarousel();
      expect(c.isLast()).toBe(false);
    });

    it('direction arranca en 1', () => {
      const c = createCarousel();
      expect(c.direction()).toBe(1);
    });

    it('translateX arranca en 0%', () => {
      const c = createCarousel();
      expect(c.translateX()).toBe('translateX(-0%)');
    });

    it('isPaused arranca en false', () => {
      const c = createCarousel();
      expect(c.isPaused()).toBe(false);
    });

    it('registra el cleanup onDestroy', () => {
      const dr = fakeDestroyRef();
      const spy = vi.spyOn(dr, 'onDestroy');
      new CarouselController({ totalItems: signal(3), destroyRef: dr });
      expect(spy).toHaveBeenCalledOnce();
    });
  });

  describe('navegación — next', () => {
    it('incrementa currentIndex', () => {
      const c = createCarousel();
      c.next();
      expect(c.currentIndex()).toBe(1);
    });

    it('setea direction a 1', () => {
      const c = createCarousel();
      c.next();
      expect(c.direction()).toBe(1);
    });

    it('vuelve al inicio si está en el último', () => {
      const c = createCarousel();
      c.goTo(4); // último (0-indexed, total=5)
      c.next();
      expect(c.currentIndex()).toBe(0);
    });

    it('actualiza isFirst y isLast', () => {
      const c = createCarousel();
      expect(c.isFirst()).toBe(true);
      c.next();
      expect(c.isFirst()).toBe(false);
      expect(c.isLast()).toBe(false);
      c.goTo(4);
      expect(c.isLast()).toBe(true);
    });
  });

  describe('navegación — previous', () => {
    it('decrementa currentIndex', () => {
      const c = createCarousel();
      c.goTo(3);
      c.previous();
      expect(c.currentIndex()).toBe(2);
    });

    it('setea direction a -1', () => {
      const c = createCarousel();
      c.goTo(2);
      c.previous();
      expect(c.direction()).toBe(-1);
    });

    it('va al último si está en el primero', () => {
      const c = createCarousel();
      c.previous();
      expect(c.currentIndex()).toBe(4);
    });
  });

  describe('navegación — goTo', () => {
    it('salta al índice indicado', () => {
      const c = createCarousel();
      c.goTo(3);
      expect(c.currentIndex()).toBe(3);
    });

    it('direction = 1 cuando avanza', () => {
      const c = createCarousel();
      c.goTo(3);
      expect(c.direction()).toBe(1);
    });

    it('direction = -1 cuando retrocede', () => {
      const c = createCarousel();
      c.goTo(2); // avanza
      c.goTo(1); // retrocede
      expect(c.direction()).toBe(-1);
    });

    it('clampa al mínimo (0)', () => {
      const c = createCarousel();
      c.goTo(-5);
      expect(c.currentIndex()).toBe(0);
    });

    it('clampa al máximo (total - 1)', () => {
      const c = createCarousel();
      c.goTo(999);
      expect(c.currentIndex()).toBe(4);
    });

    it('translateX refleja el índice actual', () => {
      const c = createCarousel();
      expect(c.translateX()).toBe('translateX(-0%)');
      c.goTo(2);
      expect(c.translateX()).toBe('translateX(-200%)');
    });
  });

  describe('totalItems reactivo', () => {
    it('isLast se actualiza si totalItems cambia', () => {
      const items = signal(5);
      const c = new CarouselController({ totalItems: items, destroyRef: fakeDestroyRef() });
      c.goTo(4);
      expect(c.isLast()).toBe(true);
      items.set(10);
      expect(c.isLast()).toBe(false);
    });
  });

  describe('sin auto-play', () => {
    it('no arranca timer si no se pasa intervalo', () => {
      vi.useFakeTimers();
      createCarousel();
      const spy = vi.spyOn(globalThis, 'setInterval');
      expect(spy).not.toHaveBeenCalled();
      vi.useRealTimers();
    });
  });

  describe('auto-play', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('arranca el timer al construirse', () => {
      const spy = vi.spyOn(globalThis, 'setInterval');
      createCarousel({ autoPlayInterval: 5000 });
      expect(spy).toHaveBeenCalledOnce();
    });

    it('avanza al siguiente slide después del intervalo', () => {
      const c = createCarousel({ autoPlayInterval: 5000 });
      vi.advanceTimersByTime(5000);
      expect(c.currentIndex()).toBe(1);
    });

    it('vuelve al inicio después del último slide', () => {
      const c = createCarousel({ autoPlayInterval: 100 });
      c.goTo(4);
      vi.advanceTimersByTime(100);
      expect(c.currentIndex()).toBe(0);
    });

    it('pause detiene el timer', () => {
      const c = createCarousel({ autoPlayInterval: 100 });
      vi.advanceTimersByTime(100); // primer tick
      expect(c.currentIndex()).toBe(1);
      c.pause();
      vi.advanceTimersByTime(500); // no debería avanzar más
      expect(c.currentIndex()).toBe(1);
      expect(c.isPaused()).toBe(true);
    });

    it('resume reinicia el timer', () => {
      const c = createCarousel({ autoPlayInterval: 100 });
      vi.advanceTimersByTime(100);
      expect(c.currentIndex()).toBe(1);
      c.pause();
      c.resume();
      vi.advanceTimersByTime(100);
      expect(c.currentIndex()).toBe(2);
      expect(c.isPaused()).toBe(false);
    });

    it('onDestroy limpia el timer', () => {
      const dr = fakeDestroyRef();
      const c = createCarousel({ destroyRef: dr, autoPlayInterval: 100 });
      vi.advanceTimersByTime(100);
      expect(c.currentIndex()).toBe(1);
      // Simular destroy ejecutando la callback registrada
      dr.destroyCbs.forEach((cb) => cb());
      vi.advanceTimersByTime(500);
      expect(c.currentIndex()).toBe(1); // no avanza más
    });
  });

  describe('teclado', () => {
    it('ArrowLeft → previous()', () => {
      const c = createCarousel();
      c.goTo(2);
      const ev = createKeyEvent('ArrowLeft');
      c.onKeydown(ev);
      expect(c.currentIndex()).toBe(1);
      expect(ev.preventDefault).toHaveBeenCalled();
    });

    it('ArrowRight → next()', () => {
      const c = createCarousel();
      const ev = createKeyEvent('ArrowRight');
      c.onKeydown(ev);
      expect(c.currentIndex()).toBe(1);
      expect(ev.preventDefault).toHaveBeenCalled();
    });

    it('Home → goTo(0)', () => {
      const c = createCarousel();
      c.goTo(3);
      const ev = createKeyEvent('Home');
      c.onKeydown(ev);
      expect(c.currentIndex()).toBe(0);
      expect(ev.preventDefault).toHaveBeenCalled();
    });

    it('End → goTo(last)', () => {
      const c = createCarousel();
      const ev = createKeyEvent('End');
      c.onKeydown(ev);
      expect(c.currentIndex()).toBe(4);
      expect(ev.preventDefault).toHaveBeenCalled();
    });

    it('otras teclas no hacen nada', () => {
      const c = createCarousel();
      c.onKeydown(createKeyEvent('ArrowUp'));
      expect(c.currentIndex()).toBe(0);
      c.onKeydown(createKeyEvent(' '));
      expect(c.currentIndex()).toBe(0);
    });
  });

  describe('con 1 solo slide', () => {
    it('next se mantiene en 0', () => {
      const c = new CarouselController({ totalItems: signal(1), destroyRef: fakeDestroyRef() });
      c.next();
      expect(c.currentIndex()).toBe(0);
    });

    it('previous se mantiene en 0', () => {
      const c = new CarouselController({ totalItems: signal(1), destroyRef: fakeDestroyRef() });
      c.previous();
      expect(c.currentIndex()).toBe(0);
    });

    it('isFirst e isLast son true', () => {
      const c = new CarouselController({ totalItems: signal(1), destroyRef: fakeDestroyRef() });
      expect(c.isFirst()).toBe(true);
      expect(c.isLast()).toBe(true);
    });
  });

  describe('con 0 slides (inicial)', () => {
    it('no explota en next', () => {
      const c = new CarouselController({ totalItems: signal(0), destroyRef: fakeDestroyRef() });
      expect(() => c.next()).not.toThrow();
      expect(c.currentIndex()).toBe(1); // incrementa aunque no haya slides
    });

    it('no explota en previous', () => {
      const c = new CarouselController({ totalItems: signal(0), destroyRef: fakeDestroyRef() });
      expect(() => c.previous()).not.toThrow();
    });

    it('isLast no es true (totalItems - 1 = -1)', () => {
      const c = new CarouselController({ totalItems: signal(0), destroyRef: fakeDestroyRef() });
      expect(c.isLast()).toBe(false);
    });
  });
});
