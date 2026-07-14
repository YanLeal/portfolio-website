export interface FooterQuickLink {
  readonly label: string;
  readonly fragment: string;
}

export interface FooterScheduleEntry {
  readonly label: string;
  readonly hours: string;
}

export interface FooterSocialLink {
  readonly platform: string;
  readonly url: string;
  readonly ariaLabel: string;
}

export interface FooterContactInfo {
  readonly address: string;
  readonly phone: string;
  readonly email: string;
}

export interface FooterHeadings {
  readonly links: string;
  readonly schedule: string;
  readonly contact: string;
}

export interface FooterData {
  readonly siteName: string;
  readonly brandDescription: string;
  readonly headings: FooterHeadings;
  readonly socialLinks: readonly FooterSocialLink[];
  readonly quickLinks: readonly FooterQuickLink[];
  readonly schedule: readonly FooterScheduleEntry[];
  readonly contactInfo: FooterContactInfo;
  readonly copyrightText: string;
}
