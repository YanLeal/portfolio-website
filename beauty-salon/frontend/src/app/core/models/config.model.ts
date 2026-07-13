import type { NavItem } from '../interfaces/navigation.interface';
import type {
  ContactPhone,
  ContactScheduleEntry,
  SocialLinks,
  TimeSlots,
} from '../interfaces/contact.interface';
import type {
  HeroSection,
  AboutSection,
  SectionHeader,
  ContactSection,
} from '../interfaces/content.interface';

export interface SiteConfig {
  readonly site: {
    readonly name: string;
    readonly url: string;
    readonly description: string;
  };
  readonly navigation: {
    readonly nav: readonly NavItem[];
    readonly footerLinks: readonly NavItem[];
  };
  readonly contact: {
    readonly phone: ContactPhone;
    readonly whatsapp: string;
    readonly email: string;
    readonly address: string;
    readonly social: SocialLinks;
    readonly schedule: readonly ContactScheduleEntry[];
  };
  readonly sections: {
    readonly hero: HeroSection;
    readonly about: AboutSection;
    readonly services: SectionHeader;
    readonly pricing: SectionHeader;
    readonly gallery: SectionHeader;
    readonly team: SectionHeader;
    readonly testimonials: SectionHeader;
    readonly process: SectionHeader;
    readonly contact: ContactSection;
  };
  readonly shared: {
    readonly ctaReservar: string;
    readonly ctaWhatsapp: string;
    readonly ctaConsultaWhatsapp: string;
  };
}
