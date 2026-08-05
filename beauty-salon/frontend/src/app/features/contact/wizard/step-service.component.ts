import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { ErrorBoundary, ServiceOptionCard } from '../../../shared';
import { ServiceService } from '../../../domains/services/service.service';
import { WizardStateService } from './wizard-state.service';
import type { Service } from '../../../domains/services/service.model';

/**
 * Wizard step 1 — service selection.
 *
 * Renders the service catalog (provided by the container via the `services`
 * input) plus the local "Otro / No estoy segura" pseudo-card. Selection and
 * validation state live in WizardStateService; this component only forwards
 * clicks and reads derived signals.
 */
@Component({
  selector: 'app-step-service',
  standalone: true,
  imports: [ErrorBoundary, ServiceOptionCard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './step-service.component.html',
  styleUrl: './step-service.component.css',
})
export class StepServiceComponent {
  private readonly wizard = inject(WizardStateService);
  private readonly serviceService = inject(ServiceService);

  /** Service catalog supplied by the container (shared, single request). */
  readonly services = input<readonly Service[] | null>(null);

  /** True when the catalog request failed (same signal the container reads). */
  readonly hasError = this.serviceService.error;

  readonly selectedServiceId = this.wizard.selectedServiceId;
  readonly attemptedSubmit = this.wizard.attemptedSubmit;

  selectService(id: string | null): void {
    this.wizard.selectService(id);
  }
}
