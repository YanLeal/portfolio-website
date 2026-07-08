import { Component } from '@angular/core';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { GalleryGrid, GalleryImage } from '../../shared/components/gallery-grid/gallery-grid';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [SectionHeader, GalleryGrid],
  templateUrl: './gallery.html',
})
export class GalleryComponent {
  readonly images: GalleryImage[] = [
    // TODO: replace with real images
    { src: '/images/gallery/1.jpg', alt: 'Corte de cabello' },
    { src: '/images/gallery/2.jpg', alt: 'Coloración' },
    { src: '/images/gallery/3.jpg', alt: 'Manicuría' },
  ];
}
