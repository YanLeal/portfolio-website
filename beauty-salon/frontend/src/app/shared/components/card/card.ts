import { Component, input } from '@angular/core';
import { CardTiltDirective } from '../../directives/card-tilt.directive';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.css',
  imports: [CardTiltDirective],
})
/**
 * Card genérica con slots nombrados [cardMedia], [cardBody], [cardActions].
 *
 * Dos variantes visuales: `lift` (hover elevado con sombra) y `base` (sutil).
 * Soporta efecto 3D tilt y animación de entrada escalonada.
 *
 * @usage
 * ```html
 * <app-card variant="lift" [tiltEnabled]="true" [entranceDelay]="100">
 *   <div cardMedia><img src="..." alt="..." /></div>
 *   <div cardBody><h3>Título</h3><p>Texto</p></div>
 *   <div cardActions><button>Acción</button></div>
 * </app-card>
 * ```
 */
export class Card {
  /** 'lift' → card-lift (translateY(-6px)), 'base' → card-base (translateY(-4px)) */
  readonly variant = input<'base' | 'lift'>('lift');

  /**
   * Entrance animation delay in ms.
   * 0 = no animation. >0 = card-entrance with stagger.
   * Tip: pasá 100, 200, 300, … desde el padre, o usá .stagger en el grid.
   */
  readonly entranceDelay = input(0);

  /**
   * Activa el efecto 3D tilt que sigue el mouse.
   * Aplica un wrapper con perspective + la directiva appCardTilt.
   */
  readonly tiltEnabled = input(false);
}
