import { Component, input } from '@angular/core';

export interface GalleryImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-gallery-grid',
  standalone: true,
  templateUrl: './gallery-grid.html',
  styleUrl: './gallery-grid.css',
})
export class GalleryGrid {
  readonly images = input.required<GalleryImage[]>();
}
