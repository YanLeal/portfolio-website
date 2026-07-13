import type { GalleryCategory } from '../types';

export interface GalleryItem {
  readonly src: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
  readonly category?: GalleryCategory;
}
