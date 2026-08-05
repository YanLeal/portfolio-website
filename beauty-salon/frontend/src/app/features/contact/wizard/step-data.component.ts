import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormField } from '../../../shared';
import { WizardStateService } from './wizard-state.service';

/**
 * Wizard step 3 — customer data.
 *
 * Name, WhatsApp and notes are bound two-way to the wizard signals via
 * ngModel. Validation presentation uses local template refs (#nameCtrl,
 * #phoneCtrl); all error copy and classes mirror the original monolith.
 */
@Component({
  selector: 'app-step-data',
  standalone: true,
  imports: [FormsModule, FormField],
  templateUrl: './step-data.component.html',
  styleUrl: './step-data.component.css',
})
export class StepDataComponent {
  private readonly wizard = inject(WizardStateService);

  readonly name = this.wizard.name;
  readonly clientPhone = this.wizard.clientPhone;
  readonly notes = this.wizard.notes;
  readonly attemptedSubmit = this.wizard.attemptedSubmit;
}
