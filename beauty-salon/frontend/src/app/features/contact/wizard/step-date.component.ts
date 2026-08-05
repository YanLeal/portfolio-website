import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField } from '../../../shared';
import { WizardStateService } from './wizard-state.service';

/**
 * Wizard step 2 — date and time selection.
 *
 * The date is bound two-way to the writable wizard signal (ngModel writes
 * through the signal). Time slots come from the container config and are
 * purely presentational; time remains optional.
 */
@Component({
  selector: 'app-step-date',
  standalone: true,
  imports: [FormsModule, FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-date.component.html',
  styleUrl: './step-date.component.css',
})
export class StepDateComponent {
  private readonly wizard = inject(WizardStateService);

  /** Morning slots ("09:00", ...) from the container's contact config. */
  readonly morningSlots = input<readonly string[]>([]);

  /** Afternoon slots ("14:00", ...) from the container's contact config. */
  readonly afternoonSlots = input<readonly string[]>([]);

  readonly selectedDate = this.wizard.selectedDate;
  readonly selectedTime = this.wizard.selectedTime;
  readonly minDate = this.wizard.minDate;
  readonly isClosedDay = this.wizard.isClosedDay;
  readonly attemptedSubmit = this.wizard.attemptedSubmit;

  selectTime(slot: string): void {
    this.wizard.selectTime(slot);
  }
}
