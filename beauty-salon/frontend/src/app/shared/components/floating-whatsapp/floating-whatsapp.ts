import { Component, input } from '@angular/core';
import { WhatsappButton } from '../whatsapp-btn/whatsapp-btn';

@Component({
  selector: 'app-floating-whatsapp',
  standalone: true,
  imports: [WhatsappButton],
  template: `
    <app-whatsapp-button variant="floating" label="WhatsApp" [phone]="phone()" />
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 50;
      animation: floatIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both;
      animation-delay: 0.5s;
    }

    @media (width >= 640px) and (width < 1024px) {
      :host {
        display: none;
      }
    }

    @keyframes floatIn {
      0% {
        opacity: 0;
        transform: translateY(1rem) scale(0.85);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `],
})
/**
 * Botón flotante de WhatsApp fijo en la esquina inferior derecha.
 *
 * Esconde en tablets (640–1024px) y muestra con animación de entrada.
 * Delega el render al componente `WhatsappButton` con
 * variante `floating`. Recibe el número de phone como input.
 *
 * @usage
 * ```html
 * <app-floating-whatsapp [phone]="waPhone()" />
 * ```
 */
export class FloatingWhatsapp {
  readonly phone = input.required<string>();
}
