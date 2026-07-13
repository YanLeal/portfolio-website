import type { TimeSlots } from './contact.interface';

export interface Stat {
  readonly value: string;
  readonly label: string;
}

export interface SectionHeader {
  readonly title: string;
  readonly subtitle: string;
}

export interface HeroSection {
  readonly tagline: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaSecondaryLabel: string;
}

export interface AboutSection {
  readonly title: string;
  readonly subtitle: string;
  readonly paragraphs: readonly string[];
  readonly stats: readonly Stat[];
}

export interface ContactSection {
  readonly title: string;
  readonly subtitle: string;
  readonly wizardSteps: readonly string[];
  readonly timeSlots: TimeSlots;
}
