import { Component, computed, ElementRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader, SvgIcon } from '../../shared';
import { ServiceService } from '../../domains/services/service.service';
import { BusinessService } from '../../domains/business/business.service';
import { ContactService } from '../../domains/contact/contact.service';
import { WizardStateService } from './wizard/wizard-state.service';
import { StepServiceComponent } from './wizard/step-service.component';
import { StepDateComponent } from './wizard/step-date.component';
import { StepDataComponent } from './wizard/step-data.component';
import { StepConfirmComponent } from './wizard/step-confirm.component';
import { ContactSidebarComponent } from './sidebar/contact-sidebar.component';

/**
 * Booking wizard container. Thin orchestration layer: owns the wizard
 * chrome (progress, nav, success block) and the DOM focus side effects;
 * every step renders through its own component driven by WizardStateService.
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    SectionHeader,
    SvgIcon,
    StepServiceComponent,
    StepDateComponent,
    StepDataComponent,
    StepConfirmComponent,
    ContactSidebarComponent,
  ],
  host: { class: 'section-padding' },
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class ContactComponent {
  private readonly serviceService = inject(ServiceService);
  readonly contactService = inject(ContactService);
  private readonly businessService = inject(BusinessService);
  private readonly wizard = inject(WizardStateService);
  private readonly el = inject(ElementRef);

  // ── Header, catalog & sidebar data ─────────────────────
  readonly contactTitle = computed(() => this.contactService.config().title);
  readonly contactSubtitle = computed(() => this.contactService.config().subtitle);
  readonly pasoLabels = computed(() => this.contactService.config().wizardSteps);
  readonly services = toSignal(this.serviceService.getAll(), { initialValue: [] });
  readonly hasError = this.serviceService.error;
  readonly address = computed(() => this.businessService.data().contact.address);
  readonly phone = computed(() => this.businessService.data().contact.phone.display);
  readonly email = computed(() => this.businessService.data().contact.email);
  readonly businessHours = this.businessService.businessHours;
  readonly isOpenNow = this.businessService.isOpenNow;

  // ── Wizard state (WizardStateService) ──────────────────
  readonly step = this.wizard.step;
  readonly submitted = this.wizard.submitted;
  readonly attemptedSubmit = this.wizard.attemptedSubmit;
  readonly popupBlocked = this.wizard.popupBlocked;
  readonly selectedService = this.wizard.selectedService;
  readonly selectedDate = this.wizard.selectedDate;
  readonly selectedTime = this.wizard.selectedTime;
  readonly clientPhone = this.wizard.clientPhone;
  readonly waUrl = this.wizard.waUrl;
  readonly canGoNext = computed(() => this.wizard.canGoNext());
  readonly isLastStep = this.wizard.isLastStep;

  // ── Navigation & focus ────────────────────────────────
  /** Enter on any input/button advances; a textarea keeps Enter for new lines. */
  onStepEnter(event: Event): void {
    if ((event.target as HTMLElement)?.tagName === 'TEXTAREA') return;
    this.nextStep();
  }

  nextStep(): void {
    const previous = this.wizard.step();
    this.wizard.nextStep();
    if (this.wizard.step() !== previous) this.focusStepHeading();
  }

  prevStep(): void {
    const previous = this.wizard.step();
    this.wizard.prevStep();
    if (this.wizard.step() !== previous) this.focusStepHeading();
  }

  onSubmit(): void {
    if (!this.wizard.onSubmit()) return;
    // Wait for the success block to render before moving focus.
    setTimeout(() => this.focusElement('.booking-success h3'));
  }

  openWhatsApp(): void {
    this.wizard.openWhatsApp();
  }

  resetForm(): void {
    this.wizard.resetForm();
    setTimeout(() => this.focusElement('.wizard-title'));
  }

  private focusStepHeading(): void {
    setTimeout(() => this.focusElement('.wizard-title'));
  }

  private focusElement(selector: string): void {
    const el = this.el.nativeElement.querySelector(selector);
    if (el) {
      el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }
}
