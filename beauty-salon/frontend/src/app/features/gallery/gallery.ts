import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { GalleryGrid } from '../../shared/components/gallery-grid/gallery-grid';
import { GalleryService } from '../../core/services/gallery.service';
import { ConfigService } from '../../core/services/config.service';

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
  private readonly configService = inject(ConfigService);
  readonly images = toSignal(this.galleryService.getAll(), { initialValue: [] });
  readonly hasError = this.galleryService.error;
  readonly galleryTitle = computed(() => this.configService.config()?.sections.gallery.title ?? 'Galería');
  readonly gallerySubtitle = computed(() => this.configService.config()?.sections.gallery.subtitle ?? 'Mirá nuestro trabajo');
}
