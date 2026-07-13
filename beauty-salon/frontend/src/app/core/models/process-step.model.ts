import type { ProcessStepIcon } from '../types';

export interface ProcessStep {
  readonly number: string;
  readonly icon: ProcessStepIcon;
  readonly title: string;
  readonly description: string;
  readonly image: string;
}
