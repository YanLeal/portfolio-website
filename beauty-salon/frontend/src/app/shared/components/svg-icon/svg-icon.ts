import { Component, input } from '@angular/core';
import type { SvgIconName } from '../../types/icon.types';

@Component({
  selector: 'svg-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-label]="ariaLabel()"
      [attr.aria-hidden]="ariaLabel() ? null : true"
    >
      @switch (name()) {
        @case ('clock') {
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        }
        @case ('arrow-right') {
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        }
        @case ('map-pin') {
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        }
        @case ('phone') {
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        }
        @case ('mail') {
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        }
        @case ('tag') {
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        }
        @case ('check') {
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        }
        @case ('star') {
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        }
        @case ('message-circle') {
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        }
        @case ('scissors') {
          <path d="M8 6a3 3 0 1 0-6 0 3 3 0 0 0 6 0z" />
          <path d="M8 18a3 3 0 1 0-6 0 3 3 0 0 0 6 0z" />
          <line x1="9" y1="7" x2="22" y2="17" />
          <line x1="9" y1="17" x2="22" y2="7" />
        }
        @case ('sparkles') {
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v4M22 12h-4M12 22v-4M2 12h4" />
        }
        @case ('hand') {
          <path d="M14 2a2 2 0 0 0-4 0v6a2 2 0 0 0 4 0V2z" />
          <path d="M8 8v2.5a4 4 0 0 0 8 0V8" />
          <path d="M12 12v8" />
          <path d="M8 20h8" />
        }
        @case ('foot') {
          <path d="M4 14c0 3 2 6 5 6h6c3 0 5-3 5-6" />
          <path d="M7 8c0-1.5 1-2 2-2s2 .5 2 2" />
          <path d="M11 8c0-1.5 1-2 2-2s2 .5 2 2" />
          <path d="M15 8c0-1.5 1-2 2-2s2 .5 2 2" />
          <path d="M7 14c3 0 5 1 5 2s2-2 5-2" />
        }
        @case ('brush') {
          <path d="M18 2 9 11l2 2 9-9-2-2z" />
          <path d="M7 13a3 3 0 0 0 0 6h2a3 3 0 0 0 0-6H7z" />
          <path d="M4 19c1.5-1 3-1.5 5-1.5" />
        }
        @case ('face') {
          <circle cx="12" cy="10" r="8" />
          <path d="M6 15c1.5 1 3.5 1.5 6 1.5s4.5-.5 6-1.5" />
          <path d="M9 10h.01" />
          <path d="M15 10h.01" />
          <path d="M12 14c-1 0-2-.5-2-1.5" />
        }
      }
    </svg>
  `,
})
export class SvgIcon {
  readonly name = input.required<SvgIconName>();
  readonly size = input<string | number>('20');
  readonly strokeWidth = input<string | number>('2');
  readonly ariaLabel = input<string>();
}
