import { Component, input } from '@angular/core';
import { CardTiltDirective } from '../../directives/card-tilt.directive';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.html',
  styleUrl: './card.css',
  imports: [CardTiltDirective],
})
export class Card {
  /** 'lift' → card-lift (translateY(-6px)), 'base' → card-base (translateY(-4px)) */
  readonly variant = input<'base' | 'lift'>('lift');

  /**
   * Entrance animation delay in ms.
   * 0 = no animation. >0 = card-entrance with stagger.
   * Tip: pasá 80, 160, 240, … desde el padre para stagger en grid.
   */
  readonly entranceDelay = input(0);

  /**
   * Activa el efecto 3D tilt que sigue el mouse.
   * Aplica un wrapper con perspective + la directiva appCardTilt.
   */
  readonly tiltEnabled = input(false);
}
