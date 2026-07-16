import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorBoundary, GalleryGrid, SectionHeader } from '../../shared';
import { GalleryService } from '../../domains/gallery/gallery.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [ErrorBoundary, SectionHeader, GalleryGrid],
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
}
