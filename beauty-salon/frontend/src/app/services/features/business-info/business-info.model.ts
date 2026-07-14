export interface BusinessInfoStat {
  readonly value: string;
  readonly label: string;
}

export interface BusinessInfoData {
  readonly siteName: string;
  readonly title: string;
  readonly subtitle: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly paragraphLead: string;
  readonly paragraphSecond: string;
  readonly stats: readonly BusinessInfoStat[];
  readonly ctaLabel: string;
}
