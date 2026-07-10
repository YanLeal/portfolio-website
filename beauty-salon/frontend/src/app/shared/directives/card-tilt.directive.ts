import { Directive, HostBinding, HostListener, input } from '@angular/core';

/**
 * appCardTilt — 3D tilt que sigue el mouse.
 *
 * Aplica `perspective(1000px) rotateX(…) rotateY(…)` sobre el host.
 *
 * @example
 * ```html
 * <div appCardTilt>
 *   <article class="card-lift">…</article>
 * </div>
 * ```
 *
 * Para desactivar condicionalmente:
 * ```html
 * <div [appCardTilt]="isEnabled">
 * ```
 */
@Directive({
  selector: '[appCardTilt]',
  standalone: true,
})
export class CardTiltDirective {
  /** Activa/desactiva el tilt. Siempre true cuando se usa sin binding. */
  readonly appCardTilt = input(true, { transform: booleanTransform });

  private readonly maxTilt = 6;         // grados máximos de rotación
  private readonly perspective = 1000;  // px

  protected tiltTransform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg)`;
  protected tiltTransition = '';

  // ── Host bindings ────────────────────────────────────────

  @HostBinding('style.transform')
  get transform(): string {
    return this.appCardTilt() ? this.tiltTransform : '';
  }

  @HostBinding('style.transition')
  get transition(): string {
    return this.tiltTransition;
  }

  @HostBinding('style.will-change')
  get willChange(): string {
    return this.appCardTilt() ? 'transform' : 'auto';
  }

  // ── Mouse events ─────────────────────────────────────────

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.appCardTilt()) return;

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
    if (!this.appCardTilt()) return;

    this.tiltTransform = `perspective(${this.perspective}px) rotateX(0deg) rotateY(0deg)`;
    this.tiltTransition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
  }
}

/** Coerce any truthy/falsy value to a strict boolean. */
function booleanTransform(v: unknown): boolean {
  return v !== false && v !== null && v !== undefined && v !== 0 && v !== '';
}
