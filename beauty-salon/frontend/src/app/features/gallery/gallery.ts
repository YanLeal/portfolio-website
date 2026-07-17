import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorBoundary, GalleryGrid, Lightbox, SectionHeader } from '../../shared';
import type { GalleryImage } from '../../shared';
import { GalleryService } from '../../domains/gallery/gallery.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [ErrorBoundary, GalleryGrid, Lightbox, SectionHeader],
  host: { class: 'section-padding' },
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class GalleryComponent {
  private readonly galleryService = inject(GalleryService);
  private readonly contentService = inject(ContentService);
  readonly images = toSignal(this.galleryService.getAll(), { initialValue: [] });
  readonly hasError = this.galleryService.error;
  readonly galleryTitle = computed(() => this.contentService.data().gallery.title);
  readonly gallerySubtitle = computed(() => this.contentService.data().gallery.subtitle);

  /** Indice de la imagen seleccionada para el lightbox (-1 = cerrado). */
  readonly selectedIndex = signal(-1);

  onImageClicked(image: GalleryImage): void {
    const idx = this.images().findIndex(i => i.src === image.src);
    this.selectedIndex.set(idx);
  }
}
