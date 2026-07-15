export type FaqCategory = string;

export interface FaqItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: FaqCategory;
  readonly order: number;
  readonly featured: boolean;
}
