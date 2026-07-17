import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Lightbox } from './lightbox';
import type { GalleryImage } from '../gallery-grid/gallery-grid';

const mockImages: GalleryImage[] = [
  { src: 'img1.jpg', alt: 'Foto 1' },
  { src: 'img2.jpg', alt: 'Foto 2', caption: 'Segunda imagen' },
  { src: 'img3.jpg', alt: 'Foto 3' },
];

describe('Lightbox', () => {
  function setup(
    overrides: {
      images?: GalleryImage[];
      selectedIndex?: number;
    } = {},
  ) {
    TestBed.configureTestingModule({ imports: [Lightbox] });
    const fixture = TestBed.createComponent(Lightbox);
    const component = fixture.componentRef.instance;

    fixture.componentRef.setInput('images', overrides.images ?? mockImages);
    fixture.componentRef.setInput('selectedIndex', overrides.selectedIndex ?? 0);

    fixture.detectChanges();
    return { fixture, component, el: fixture.nativeElement as HTMLElement };
  }

  it('tiene clase app-lightbox en el host', () => {
    const { el } = setup();
    expect(el.classList.contains('app-lightbox')).toBe(true);
  });

  it('no renderiza contenido cuando selectedIndex es -1', () => {
    const { el } = setup({ selectedIndex: -1 });
    expect(el.querySelector('.lightbox-content')).toBeFalsy();
  });

  it('renderiza contenido cuando selectedIndex es >= 0', () => {
    const { el } = setup({ selectedIndex: 0 });
    expect(el.querySelector('.lightbox-content')).toBeTruthy();
  });

  it('muestra la imagen correcta segun selectedIndex', () => {
    const { el } = setup({ selectedIndex: 1 });
    const img = el.querySelector<HTMLImageElement>('.lightbox-image-wrapper img');
    expect(img?.getAttribute('src')).toBe('img2.jpg');
    expect(img?.getAttribute('alt')).toBe('Foto 2');
  });

  it('boton prev visible solo cuando hay anterior', () => {
    const { fixture, el } = setup({ selectedIndex: 0 });
    expect(el.querySelector('.lightbox-btn--prev')).toBeFalsy();
    expect(el.querySelector('.lightbox-btn--next')).toBeTruthy();

    fixture.componentRef.setInput('selectedIndex', 1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lightbox-btn--prev')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.lightbox-btn--next')).toBeTruthy();

    fixture.componentRef.setInput('selectedIndex', 2);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.lightbox-btn--prev')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.lightbox-btn--next')).toBeFalsy();
  });

  it('counter muestra "N / Total"', () => {
    const { el } = setup({ selectedIndex: 1 });
    expect(el.querySelector('.lightbox-counter')?.textContent).toBe('2 / 3');
  });

  it('click prev emite indexChange con indice - 1', () => {
    const { fixture, el } = setup({ selectedIndex: 1 });
    let emitted = -1;
    fixture.componentRef.instance.indexChange.subscribe(v => (emitted = v));

    el.querySelector<HTMLElement>('.lightbox-btn--prev')!.click();
    expect(emitted).toBe(0);
  });

  it('click next emite indexChange con indice + 1', () => {
    const { fixture, el } = setup({ selectedIndex: 1 });
    let emitted = -1;
    fixture.componentRef.instance.indexChange.subscribe(v => (emitted = v));

    el.querySelector<HTMLElement>('.lightbox-btn--next')!.click();
    expect(emitted).toBe(2);
  });

  it('emite close en onClose', () => {
    const { component } = setup();
    let emitted = false;
    component.close.subscribe(() => (emitted = true));
    component.onClose();
    expect(emitted).toBe(true);
  });

  it('ArrowLeft navega a prev', () => {
    const { fixture, el } = setup({ selectedIndex: 1 });
    let emitted = -1;
    fixture.componentRef.instance.indexChange.subscribe(v => (emitted = v));

    el.querySelector<HTMLElement>('.lightbox-content')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(emitted).toBe(0);
  });

  it('ArrowRight navega a next', () => {
    const { fixture, el } = setup({ selectedIndex: 1 });
    let emitted = -1;
    fixture.componentRef.instance.indexChange.subscribe(v => (emitted = v));

    el.querySelector<HTMLElement>('.lightbox-content')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(emitted).toBe(2);
  });

  it('teclas sin efecto cuando no hay prev/next', () => {
    const { fixture, el } = setup({ selectedIndex: 0 });
    let emitted = -1;
    fixture.componentRef.instance.indexChange.subscribe(v => (emitted = v));

    el.querySelector<HTMLElement>('.lightbox-content')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(emitted).toBe(-1);
  });

  it('caption se muestra si la imagen tiene caption', () => {
    const { el } = setup({ selectedIndex: 1 });
    expect(el.querySelector('.lightbox-caption')).toBeTruthy();
    expect(el.querySelector('.lightbox-caption')?.textContent?.trim()).toBe('Segunda imagen');
  });

  it('caption no se muestra si la imagen no tiene caption', () => {
    const { el } = setup({ selectedIndex: 0 });
    expect(el.querySelector('.lightbox-caption')).toBeFalsy();
  });

  it('aria-describedby en img apunta al figcaption', () => {
    const { el } = setup({ selectedIndex: 1 });
    const img = el.querySelector<HTMLImageElement>('.lightbox-image-wrapper img');
    const figcaption = el.querySelector<HTMLElement>('.lightbox-caption');
    expect(img?.getAttribute('aria-describedby')).toBe(figcaption?.id);
  });

  it('click en imagen activa zoom (scale 2)', () => {
    const { component, el } = setup({ selectedIndex: 1 });
    expect(component.isZoomed()).toBe(false);

    el.querySelector<HTMLElement>('.lightbox-image-wrapper')!.click();
    expect(component.isZoomed()).toBe(true);
  });

  it('doble click resetea zoom', () => {
    const { component, el } = setup({ selectedIndex: 1 });

    el.querySelector<HTMLElement>('.lightbox-image-wrapper')!.click();
    expect(component.isZoomed()).toBe(true);

    el.querySelector<HTMLElement>('.lightbox-image-wrapper')!
      .dispatchEvent(new MouseEvent('dblclick'));
    expect(component.isZoomed()).toBe(false);
  });

  it('wheel cambia escala dentro de limites (0.5-4)', () => {
    const { component, el } = setup({ selectedIndex: 1 });

    el.querySelector<HTMLElement>('.lightbox-image-wrapper')!
      .dispatchEvent(new WheelEvent('wheel', { deltaY: -100 }));
    expect(component.isZoomed()).toBe(true);

    for (let i = 0; i < 20; i++) {
      el.querySelector<HTMLElement>('.lightbox-image-wrapper')!
        .dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
    }
    expect(component.isZoomed()).toBe(true);
  });

  it('lightbox usa Modal con fullscreen', () => {
    const { el } = setup({ selectedIndex: 0 });
    const modal = el.querySelector('app-modal');
    expect(modal).toBeTruthy();
  });

  it('resetZoom restaura escala y pan', () => {
    const { component } = setup({ selectedIndex: 1 });

    component.zoomScale.set(2);
    component.panX.set(100);
    component.panY.set(50);
    component.resetZoom();

    expect(component.isZoomed()).toBe(false);
  });

  it('zoomStyle devuelve null cuando no esta en zoom', () => {
    const { component } = setup({ selectedIndex: 0 });
    expect(component.zoomStyle()).toBeNull();
  });
});
