import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { SvgIcon } from '../../../shared';

/** One row of the weekly schedule, shaped like BusinessService.businessHours. */
export interface SidebarScheduleDay {
  readonly day: string;
  readonly label: string;
  readonly hours: string;
  readonly isClosed: boolean;
  readonly note?: string;
}

/**
 * Booking page sidebar — salon contact info, weekly schedule, social links
 * and WhatsApp CTA.
 *
 * Pure presentational: every value arrives via inputs, no services injected.
 * Hardcoded phone/mail/WhatsApp links are preserved on purpose (a later task
 * wires them to BusinessService data).
 */
@Component({
  selector: 'app-contact-sidebar',
  standalone: true,
  imports: [SvgIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-sidebar.component.html',
  styleUrl: './contact-sidebar.component.css',
})
export class ContactSidebarComponent {
  readonly address = input.required<string>();
  readonly phone = input.required<string>();
  readonly email = input.required<string>();
  readonly businessHours = input<readonly SidebarScheduleDay[]>();
  readonly isOpenNow = input.required<boolean>();
}
