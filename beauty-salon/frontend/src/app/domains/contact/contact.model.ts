export interface TimeSlots {
  readonly morning: readonly string[];
  readonly afternoon: readonly string[];
}

export interface ContactConfig {
  readonly title: string;
  readonly subtitle: string;
  readonly wizardSteps: readonly string[];
  readonly timeSlots: TimeSlots;
}
