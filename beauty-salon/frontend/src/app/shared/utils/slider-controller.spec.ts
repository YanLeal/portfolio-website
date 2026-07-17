import { describe, it, expect, vi } from 'vitest';
import { SliderController, type SliderConfig } from './slider-controller';

// ─── Helpers ──────────────────────────────────────────────────────────────

function createController(overrides?: Partial<SliderConfig>): SliderController {
  return new SliderController({ initialPosition: 50, step: 5, ...overrides });
}

function createPointerEvent(clientX: number): PointerEvent {
  return { clientX, preventDefault: vi.fn() } as unknown as PointerEvent;
}

function createKeyEvent(key: string): KeyboardEvent {
  return { key, preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as KeyboardEvent;
}

// ─── Tests ────────────────────────────────────────────────────────────────

describe('SliderController', () => {
  describe('estado inicial', () => {
    it('arranca en la posición 50 por defecto', () => {
      const s = new SliderController();
      expect(s.position()).toBe(50);
    });

    it('arranca en initialPosition si se especifica', () => {
      const s = createController({ initialPosition: 75 });
      expect(s.position()).toBe(75);
    });

    it('arranca en 0 si initialPosition es 0', () => {
      const s = createController({ initialPosition: 0 });
      expect(s.position()).toBe(0);
    });

    it('isDragging arranca en false', () => {
      const s = createController();
      expect(s.isDragging()).toBe(false);
    });

    it('announcement arranca vacío', () => {
      const s = createController();
      expect(s.announcement()).toBe('');
    });

    it('valueText refleja la posición inicial', () => {
      const s = createController();
      expect(s.valueText()).toBe('Before 50%, After 50%');
    });

    it('step por defecto es 5', () => {
      // Se comprueba indirectamente con las flechas
      const s = new SliderController();
      s.onKeydown(createKeyEvent('ArrowLeft'));
      expect(s.position()).toBe(45);
    });
  });

  describe('startDrag', () => {
    it('activa isDragging', () => {
      const s = createController();
      s.startDrag(createPointerEvent(200));
      expect(s.isDragging()).toBe(true);
    });

    it('mantiene la posición actual', () => {
      const s = createController({ initialPosition: 30 });
      s.startDrag(createPointerEvent(100));
      expect(s.position()).toBe(30);
    });
  });

  describe('updateDrag', () => {
    it('mueve la posición proporcionalmente al desplazamiento', () => {
      const s = createController();
      s.startDrag(createPointerEvent(0)); // click en borde izquierdo
      // containerWidth = 400, mover 100px a la derecha = 25%
      s.updateDrag(createPointerEvent(100), 400);
      expect(s.position()).toBe(75); // startPos(50) + (100/400)*100 = 75
    });

    it('no hace nada si no está arrastrando', () => {
      const s = createController();
      s.updateDrag(createPointerEvent(100), 400);
      expect(s.position()).toBe(50);
    });

    it('clampa a 0 si el delta es negativo grande', () => {
      const s = createController();
      s.startDrag(createPointerEvent(400)); // click en borde derecho
      // containerWidth = 400, mover 500px a la izquierda = -125%
      s.updateDrag(createPointerEvent(-100), 400);
      expect(s.position()).toBe(0);
    });

    it('clampa a 100 si el delta es positivo grande', () => {
      const s = createController();
      s.startDrag(createPointerEvent(0)); // click en borde izquierdo
      s.updateDrag(createPointerEvent(600), 400); // +150%
      expect(s.position()).toBe(100);
    });

    it('redondea la posición', () => {
      const s = createController();
      s.startDrag(createPointerEvent(0));
      s.updateDrag(createPointerEvent(17), 400); // (17/400)*100 = 4.25 -> 50 + 4.25 = 54.25 -> round = 54
      expect(s.position()).toBe(54);
    });
  });

  describe('endDrag', () => {
    it('desactiva isDragging', () => {
      const s = createController();
      s.startDrag(createPointerEvent(200));
      s.endDrag();
      expect(s.isDragging()).toBe(false);
    });

    it('genera el anuncio con valueText', () => {
      const s = createController();
      s.startDrag(createPointerEvent(0));
      s.updateDrag(createPointerEvent(100), 400); // posición 75
      s.endDrag();
      expect(s.announcement()).toBe('Before 75%, After 25%');
    });

    it('no hace nada si no está arrastrando', () => {
      const s = createController();
      s.endDrag();
      expect(s.announcement()).toBe('');
    });
  });

  describe('teclado — onKeydown', () => {
    it('ArrowLeft decrementa en step', () => {
      const s = createController();
      const handled = s.onKeydown(createKeyEvent('ArrowLeft'));
      expect(handled).toBe(true);
      expect(s.position()).toBe(45);
    });

    it('ArrowLeft no baja de 0', () => {
      const s = createController({ initialPosition: 3 });
      s.onKeydown(createKeyEvent('ArrowLeft'));
      expect(s.position()).toBe(0);
    });

    it('ArrowRight incrementa en step', () => {
      const s = createController();
      s.onKeydown(createKeyEvent('ArrowRight'));
      expect(s.position()).toBe(55);
    });

    it('ArrowRight no pasa de 100', () => {
      const s = createController({ initialPosition: 98 });
      s.onKeydown(createKeyEvent('ArrowRight'));
      expect(s.position()).toBe(100);
    });

    it('Home va a 0', () => {
      const s = createController();
      s.onKeydown(createKeyEvent('Home'));
      expect(s.position()).toBe(0);
    });

    it('End va a 100', () => {
      const s = createController();
      s.onKeydown(createKeyEvent('End'));
      expect(s.position()).toBe(100);
    });

    it('genera anuncio al usar teclas de slider', () => {
      const s = createController();
      s.onKeydown(createKeyEvent('ArrowRight'));
      expect(s.announcement()).toBe('Before 55%, After 45%');
    });

    it('devuelve false para teclas que no son de slider', () => {
      const s = createController();
      const handled = s.onKeydown(createKeyEvent('Enter'));
      expect(handled).toBe(false);
      expect(s.position()).toBe(50);
      expect(s.announcement()).toBe('');
    });

    it('devuelve false para teclas de flecha no relacionadas', () => {
      const s = createController();
      expect(s.onKeydown(createKeyEvent('ArrowUp'))).toBe(false);
      expect(s.onKeydown(createKeyEvent('ArrowDown'))).toBe(false);
    });

    it('llama preventDefault y stopPropagation en teclas manejadas', () => {
      const s = createController();
      const ev = createKeyEvent('ArrowRight');
      s.onKeydown(ev);
      expect(ev.preventDefault).toHaveBeenCalled();
      expect(ev.stopPropagation).toHaveBeenCalled();
    });

    it('NO llama stopPropagation en teclas no manejadas', () => {
      const s = createController();
      const ev = createKeyEvent('Enter');
      s.onKeydown(ev);
      expect(ev.stopPropagation).not.toHaveBeenCalled();
    });
  });

  describe('reset', () => {
    it('vuelve a la posición inicial si no se pasa argumento', () => {
      const s = createController({ initialPosition: 50 });
      s.position.set(80);
      s.reset();
      expect(s.position()).toBe(50);
    });

    it('usa initialPosition por defecto', () => {
      const s = createController({ initialPosition: 25 });
      s.position.set(90);
      s.reset();
      expect(s.position()).toBe(25);
    });

    it('usa la posición pasada como argumento', () => {
      const s = createController({ initialPosition: 50 });
      s.position.set(80);
      s.reset(20);
      expect(s.position()).toBe(20);
    });
  });

  describe('step personalizado', () => {
    it('usa el step configurado para flechas', () => {
      const s = createController({ step: 10 });
      s.onKeydown(createKeyEvent('ArrowRight'));
      expect(s.position()).toBe(60);
    });

    it('step=1 permite movimiento fino', () => {
      const s = createController({ step: 1 });
      s.onKeydown(createKeyEvent('ArrowRight'));
      expect(s.position()).toBe(51);
      s.onKeydown(createKeyEvent('ArrowLeft'));
      expect(s.position()).toBe(50);
    });
  });

  describe('announce personalizado', () => {
    it('usa la función announce si se especifica', () => {
      const s = createController({
        initialPosition: 30,
        announce: (pos) => `Posición: ${pos}%`,
      });
      expect(s.valueText()).toBe('Posición: 30%');
    });

    it('usa announce para el anuncio post-drag', () => {
      const s = createController({
        announce: (pos) => `Slider en ${Math.round(pos)}%`,
      });
      s.startDrag(createPointerEvent(0));
      s.endDrag(); // no hay movimiento, posición sigue en 50
      expect(s.announcement()).toBe('Slider en 50%');
    });

    it('usa announce post-keyboard', () => {
      const s = createController({
        announce: (pos) => `Slider en ${Math.round(pos)}%`,
      });
      s.onKeydown(createKeyEvent('ArrowRight'));
      expect(s.announcement()).toBe('Slider en 55%');
    });
  });

  describe('sin configuración', () => {
    it('funciona con configuración vacía', () => {
      const s = new SliderController();
      expect(s.position()).toBe(50);
      expect(s.isDragging()).toBe(false);
      expect(s.valueText()).toBe('Before 50%, After 50%');
    });
  });
});
