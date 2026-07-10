import { Directive, ElementRef, inject, input, NgZone, OnDestroy, output } from '@angular/core';

/**
 * appReveal — IntersectionObserver directive for scroll-triggered animations.
 *
 * Agrega una clase de animación cuando el elemento entra en el viewport.
 * Ideal para animaciones de entrada activadas por scroll.
 *
 * ## Uso básico
 *
 * ```html
 * <!-- Se desliza hacia arriba al aparecer en pantalla -->
 * <div appReveal>
 *   contenido
 * </div>
 * ```
 *
 * ## Con clase personalizada
 *
 * ```html
 * <!-- Aparece con fade en lugar de slide -->
 * <div appReveal animationClass="anim-fade-in">
 *   contenido
 * </div>
 * ```
 *
 * ## Combinado con hidden para entrada perfecta
 *
 * ```html
 * <!-- Elemento invisible hasta que se revela -->
 * <div appReveal class="anim-hidden">
 *   contenido
 * </div>
 * ```
 *
 * ## Margen personalizado (cuándo se dispara)
 *
 * ```html
 * <!-- Se dispara cuando el elemento está a 150px del viewport -->
 * <div appReveal rootMargin="0px 0px -150px 0px">
 *   contenido
 * </div>
 * ```
 *
 * ## Sin repeat (default: una sola vez)
 *
 * ```html
 * <!-- Se anima solo la primera vez que entra -->
 * <div appReveal [once]="true">
 *   contenido
 * </div>
 * ```
 *
 * ## Con repeat (animación cada vez que entra/sale)
 *
 * ```html
 * <!-- Se anima cada vez que entra al viewport -->
 * <div appReveal [once]="false">
 *   contenido
 * </div>
 * ```
 *
 * ## Evento de revelado
 *
 * ```html
 * <div appReveal (revealed)="onRevealed($event)">
 *   contenido
 * </div>
 * ```
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements OnDestroy {
  // ── Inputs ──────────────────────────────────────────

  /** Clase CSS de animación que se agrega al revelar el elemento.
   *  Default: anim-slide-up (definida en animation.css) */
  readonly animationClass = input<string>('anim-slide-up');

  /** Root margin para IntersectionObserver.
   *  El último valor (bottom) controla qué tan temprano se dispara.
   *  Default: -50px → se dispara cuando el elemento está 50px dentro del viewport.
   *  -100px → se dispara más temprano (100px antes de que sea completamente visible). */
  readonly rootMargin = input<string>('0px 0px -50px 0px');

  /** Si true, la animación se reproduce solo la primera vez.
   *  Si false, remueve la clase cuando el elemento sale del viewport
   *  y la vuelve a agregar cuando re-entra. */
  readonly once = input<boolean>(true);

  // ── Outputs ─────────────────────────────────────────

  /** Se emite cuando el elemento es revelado por primera vez
   *  (o cada vez si once=false). */
  readonly revealed = output<void>();

  // ── Dependencies ────────────────────────────────────

  private readonly elementRef = inject(ElementRef<Element>);
  private readonly ngZone = inject(NgZone);
  private observer: IntersectionObserver | null = null;

  constructor() {
    this.setupObserver();
  }

  // ── Setup ───────────────────────────────────────────

  private setupObserver(): void {
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      { rootMargin: this.rootMargin() },
    );

    this.observer.observe(this.elementRef.nativeElement);
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        this.reveal(entry.target);
      } else if (!this.once()) {
        this.hide(entry.target);
      }
    }
  }

  private reveal(target: Element): void {
    // ngZone.run asegura que el output y change detection
    // se ejecuten dentro del ciclo de Angular
    this.ngZone.run(() => {
      target.classList.add(this.animationClass());
      this.revealed.emit();
    });

    if (this.once()) {
      this.observer?.unobserve(target);
    }
  }

  private hide(target: Element): void {
    this.ngZone.run(() => {
      target.classList.remove(this.animationClass());
    });
  }

  // ── Cleanup ─────────────────────────────────────────

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
