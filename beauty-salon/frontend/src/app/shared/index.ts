export {
  Badge,
  Card,
  Carousel,
  Container,
  CtaButton,
  ErrorBoundary,
  EmptyState,
  FaqItem,
  FloatingWhatsapp,
  FormField,
  GalleryGrid,
  ImageCompare,
  SectionHeader,
  ServiceCard,
  ServiceOptionCard,
  SvgIcon,
  TestimonialCard,
  WhatsappButton,
} from './components';

export { CardTiltDirective, RevealDirective } from './directives';
export type { CtaButtonVariant, WaVariant, SvgIconName } from './types';
export { CarouselController } from './utils';
export type { CarouselConfig } from './utils';

// ── Pipes ─────────────────────────────────────────────────
export { DurationPipe, TruncatePipe, PhonePipe } from './pipes';

// ── Tokens ────────────────────────────────────────────────
export { WHATSAPP_NUMBER, SITE_CONFIG } from './tokens';
export type { SiteConfig } from './tokens';
