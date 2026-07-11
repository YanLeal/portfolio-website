export type ProcessStepIcon =
  | 'search'
  | 'message-circle'
  | 'map-pin'
  | 'star';

export interface ProcessStep {
  number: string;
  icon: ProcessStepIcon;
  title: string;
  description: string;
  image: string;
}
