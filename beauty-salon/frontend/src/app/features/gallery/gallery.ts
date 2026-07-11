import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { GalleryGrid } from '../../shared/components/gallery-grid/gallery-grid';
import { GalleryService } from '../../core/services/gallery.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [SectionHeader, GalleryGrid],
  host: { class: 'section-padding' },
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class GalleryComponent {
  private readonly galleryService = inject(GalleryService);
  readonly images = toSignal(this.galleryService.getAll(), { initialValue: [] });
}
