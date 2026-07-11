export type ServiceCategory =
  | 'cabello'
  | 'uñas'
  | 'maquillaje'
  | 'tratamientos';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  duration: string;
  icon: string;
  category: ServiceCategory;
  sortOrder: number;
  image?: string;
  isPopular?: boolean;
  isNew?: boolean;
  priceNote?: string;
}
