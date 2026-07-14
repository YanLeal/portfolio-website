import type { ServiceIcon, ServiceCategory } from './service.types';

export interface Service {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly price: number;
  readonly durationMinutes: number;
  readonly duration: string;
  readonly icon: ServiceIcon;
  readonly category: ServiceCategory;
  readonly sortOrder: number;
  readonly image?: string;
  readonly isPopular?: boolean;
  readonly isNew?: boolean;
  readonly priceNote?: string;
}
