export interface Promotion {
  readonly month: string;
  readonly discount: string;
  readonly service: string;
  readonly description: string;
  readonly image: string;
  readonly ctaLabel: string;
  readonly spotsLeft: number;
  readonly validUntil: string;
  readonly validUntilDate?: string;
  readonly isActive?: boolean;
}
