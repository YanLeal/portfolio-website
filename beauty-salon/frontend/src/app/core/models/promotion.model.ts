export interface Promotion {
  month: string;
  discount: string;
  service: string;
  description: string;
  image: string;
  ctaLabel: string;
  spotsLeft: number;
  validUntil: string;
  validUntilDate?: string;
  isActive?: boolean;
}
