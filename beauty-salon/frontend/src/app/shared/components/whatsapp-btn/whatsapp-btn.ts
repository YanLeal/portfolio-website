import { Component, computed, inject, input } from '@angular/core';
import { BusinessService } from '../../../domains/business/business.service';
import type { WaVariant } from '../../types/button.types';

@Component({
  selector: 'app-whatsapp-btn',
  standalone: true,
  template: `
    <a
      [href]="waLink()"
      target="_blank"
      rel="noopener noreferrer"
      class="wa-link"
      [class.wa-hero]="variant() === 'hero'"
      [class.wa-footer]="variant() === 'footer'"
      [class.wa-services]="variant() === 'services'"
      [class.wa-floating]="variant() === 'floating'"
      [attr.aria-label]="ariaLabel() || label() || 'Contactanos por WhatsApp'"
    >
      <svg class="wa-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      </svg>
      @if (showLabel()) {
        <span class="wa-label">{{ label() }}</span>
      }
    </a>
  `,
  styles: [`
    :host {
      display: inline-flex;
    }

    .wa-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-family: var(--font-sans, system-ui, sans-serif);
      font-weight: 600;
      -webkit-tap-highlight-color: transparent;
      transition:
        background 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease,
        transform 0.15s ease,
        box-shadow 0.2s ease;
    }

    .wa-link:hover {
      transform: translateY(-2px);
    }

    .wa-link:active {
      transform: translateY(0) scale(0.97);
    }

    .wa-link:focus-visible {
      outline: 2px solid var(--color-whatsapp);
      outline-offset: 2px;
    }

    .wa-icon {
      width: 1.25rem;
      height: 1.25rem;
      flex-shrink: 0;
    }

    /* ─── Hero variant ────────────────────────────── */

    .wa-hero {
      justify-content: center;
      width: 100%;
      padding: 0.875rem 2.5rem;
      font-size: 0.9375rem;
      color: #fff;
      background: var(--color-whatsapp);
      border: none;
      border-radius: var(--radius-xs);
      letter-spacing: 0.02em;
    }

    .wa-hero:hover {
      background: var(--color-whatsapp-dark);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    }

    .wa-hero .wa-icon {
      width: 1.125rem;
      height: 1.125rem;
    }

    @media (width >= 480px) {
      .wa-hero {
        width: auto;
        min-width: 12rem;
      }
    }

    /* ─── Footer variant ──────────────────────────── */

    .wa-footer {
      justify-content: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 50%;
      color: color-mix(in srgb, #fff 50%, transparent);
      border: 1px solid color-mix(in srgb, #fff 12%, transparent);
      background: transparent;
    }

    .wa-footer:hover {
      color: var(--color-whatsapp);
      border-color: color-mix(in srgb, var(--color-whatsapp) 50%, transparent);
      background: color-mix(in srgb, var(--color-whatsapp) 8%, transparent);
      transform: translateY(-2px);
    }

    .wa-footer .wa-icon {
      width: 1.125rem;
      height: 1.125rem;
    }

    .wa-footer .wa-label {
      display: none;
    }

    /* ─── Services variant ────────────────────────── */

    .wa-services {
      width: 100%;
      padding: 0.875rem 1.5rem;
      font-size: 0.9375rem;
      color: #fff;
      background: var(--color-whatsapp);
      border: none;
      border-radius: var(--radius-xs);
      justify-content: center;
    }

    .wa-services:hover {
      background: var(--color-whatsapp-dark);
      box-shadow: 0 4px 16px rgba(37, 211, 102, 0.35);
    }

    @media (width >= 640px) {
      .wa-services {
        width: auto;
      }
    }

    /* ─── Floating variant ───────────────────────── */

    .wa-floating {
      padding: 0.75rem 1rem 0.75rem 0.875rem;
      font-size: 0.875rem;
      color: #fff;
      background: var(--color-whatsapp);
      border: none;
      border-radius: var(--radius-full);
      box-shadow:
        0 4px 12px rgba(37, 211, 102, 0.35),
        0 2px 4px rgba(0, 0, 0, 0.08);
    }

    .wa-floating:hover {
      background: var(--color-whatsapp-dark);
      box-shadow:
        0 6px 20px rgba(37, 211, 102, 0.4),
        0 3px 6px rgba(0, 0, 0, 0.1);
    }

    .wa-floating .wa-icon {
      width: 1.375rem;
      height: 1.375rem;
    }

    @media (width >= 420px) and (width < 640px) {
      .wa-floating {
        padding: 0.75rem;
      }
      .wa-floating .wa-label {
        display: none;
      }
    }

    @media (width < 420px) {
      .wa-floating {
        display: none;
      }
    }
  `],
})
export class WhatsappButtonComponent {
  private readonly businessService = inject(BusinessService);
  readonly waLink = computed(() => `https://wa.me/${this.businessService.data().contact.whatsapp}`);

  /** Hero, footer, or services styling variant */
  readonly variant = input<WaVariant>('services');

  /** Whether to show the text label next to the icon */
  readonly showLabel = input(true);

  /** Custom label text; defaults to 'WhatsApp' */
  readonly label = input('WhatsApp');

  /** Override the auto-generated aria-label */
  readonly ariaLabel = input<string>();
}
