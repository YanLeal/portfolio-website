import { Directive, HostBinding, HostListener } from '@angular/core';

/**
 * appCardTilt — 3D tilt que sigue el mouse.
 *
 * Aplica `perspective(1000px) rotateX(…) rotateY(…)` sobre el host.
 * El host DEBE tener este CSS (lo agrega automáticamente):
 *   - will-change: transform
 *
 * La transición de reset usa el spring easing del sistema.
 *
 * Uso: envolvé un elemento con hover propio (por ej. card-lift)
 *      y el tilt no compite porque opera sobre el wrapper.
 *
 * @example
 * ```html
 * <div appCardTilt>
 *   <article class="card-lift">…</article>
 * </div>
 * ```
 */
@Directive({
  selector: '[appCardTilt]',
  standalone: true,
})
export class CardTiltDirective {
  private readonly maxTilt = 6;         // grados máximos de rotación
  private readonly perspective = 1000;  // px

  protected tiltTransform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg)`;
  protected tiltTransition = '';

  // ── Host bindings ────────────────────────────────────────

  @HostBinding('style.transform')
  get transform(): string {
    return this.tiltTransform;
  }

  @HostBinding('style.transition')
  get transition(): string {
    return this.tiltTransition;
  }

  @HostBinding('style.will-change')
  get willChange(): string {
    return 'transform';
  }

  // ── Mouse events ─────────────────────────────────────────

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * this.maxTilt;
    const rotateX = -((y - centerY) / centerY) * this.maxTilt;

    this.tiltTransform =
      `perspective(${this.perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    this.tiltTransition = 'none';
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.tiltTransform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg)`;
    this.tiltTransition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
  }
}
