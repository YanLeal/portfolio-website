export interface BusinessPhone {
  readonly display: string;
  readonly tel: string;
}

export interface BusinessScheduleEntry {
  readonly label: string;
  readonly hours: string;
}

export interface BusinessSocial {
  readonly instagram: string;
  readonly facebook: string;
}

export interface BusinessContact {
  readonly phone: BusinessPhone;
  readonly whatsapp: string;
  readonly email: string;
  readonly address: string;
  readonly mapUrl?: string;
  readonly social: BusinessSocial;
  readonly schedule: readonly BusinessScheduleEntry[];
}

export interface BusinessSite {
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly logo?: string;
}

export interface BusinessSeo {
  readonly title: string;
  readonly description: string;
  readonly ogImage: string;
  readonly ogLocale: string;
  readonly canonical: string;
}

export interface BusinessConfig {
  readonly site: BusinessSite;
  readonly contact: BusinessContact;
  readonly seo: BusinessSeo;
}
