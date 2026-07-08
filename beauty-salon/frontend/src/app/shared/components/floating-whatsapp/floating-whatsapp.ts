import { Component } from '@angular/core';
import { WhatsappButtonComponent } from '../whatsapp-btn/whatsapp-btn';

@Component({
  selector: 'app-floating-whatsapp',
  standalone: true,
  imports: [WhatsappButtonComponent],
  template: `
    <app-whatsapp-btn variant="floating" label="WhatsApp" />
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
export class FloatingWhatsappComponent {}
