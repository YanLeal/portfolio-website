export interface SectionHeader {
  readonly title: string;
  readonly subtitle: string;
}

export interface Stat {
  readonly value: string;
  readonly label: string;
}

export interface AboutContent {
  readonly title: string;
  readonly subtitle: string;
  readonly paragraphs: readonly string[];
  readonly stats: readonly Stat[];
}

export interface HeroContent {
  readonly businessName: string;
  readonly tagline: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaSecondaryLabel: string;
}

export interface ContentData {
  readonly hero: HeroContent;
  readonly about: AboutContent;
  readonly services: SectionHeader;
  readonly pricing: SectionHeader;
  readonly gallery: SectionHeader;
  readonly team: SectionHeader;
  readonly testimonials: SectionHeader;
  readonly process: SectionHeader;
}
