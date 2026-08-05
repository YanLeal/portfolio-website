import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { WizardStateService } from './wizard-state.service';

/**
 * Wizard step 4 — review and confirm.
 *
 * Pure read-only summary of the wizard state. Renders nothing until a
 * service is selected (the container only renders this step on step 4).
 */
@Component({
  selector: 'app-step-confirm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-confirm.component.html',
  styleUrl: './step-confirm.component.css',
})
export class StepConfirmComponent {
  private readonly wizard = inject(WizardStateService);

  readonly selectedService = this.wizard.selectedService;
  readonly selectedDate = this.wizard.selectedDate;
  readonly selectedTime = this.wizard.selectedTime;
  readonly name = this.wizard.name;
  readonly clientPhone = this.wizard.clientPhone;
  readonly notes = this.wizard.notes;
}
