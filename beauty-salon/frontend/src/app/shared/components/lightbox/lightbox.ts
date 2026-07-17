import { Component, computed, input, output, signal } from '@angular/core';
import { Modal } from '../modal/modal';
import type { GalleryImage } from '../gallery-grid/gallery-grid';

let lightboxIdCounter = 0;

@Component({
  selector: 'app-lightbox',
  standalone: true,
  imports: [Modal],
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.css',
  host: { class: 'app-lightbox' },
})
export class Lightbox {
  readonly images = input.required<GalleryImage[]>();
  readonly selectedIndex = input.required<number>();
  readonly close = output<void>();
  readonly indexChange = output<number>();

  readonly isOpen = computed(() => {
    const idx = this.selectedIndex();
    const imgs = this.images();
    return idx >= 0 && idx < imgs.length;
  });

  readonly currentImage = computed<GalleryImage | null>(() => {
    if (!this.isOpen()) return null;
    return this.images()[this.selectedIndex()];
  });

  readonly hasPrev = computed(() => this.selectedIndex() > 0);
  readonly hasNext = computed(() => this.selectedIndex() < this.images().length - 1);
  readonly counterText = computed(() => `${this.selectedIndex() + 1} / ${this.images().length}`);
  readonly hasCaption = computed(() => !!this.currentImage()?.caption);
  readonly captionId = `lightbox-caption-${++lightboxIdCounter}`;

  readonly zoomScale = signal(1);
  readonly panX = signal(0);
  readonly panY = signal(0);
  readonly isDragging = signal(false);

  private dragStart = { x: 0, y: 0, panX: 0, panY: 0 };
  private touchStartX = 0;
  private touchStartY = 0;
  private touchStartTime = 0;

  readonly isZoomed = computed(() => this.zoomScale() !== 1);
  readonly zoomStyle = computed(() => {
    if (!this.isZoomed()) return null;
    return `translate(${this.panX()}px, ${this.panY()}px) scale(${this.zoomScale()})`;
  });

  goPrev(): void {
    this.resetZoom();
    this.indexChange.emit(this.selectedIndex() - 1);
  }

  goNext(): void {
    this.resetZoom();
    this.indexChange.emit(this.selectedIndex() + 1);
  }

  onClose(): void {
    this.close.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' && this.hasPrev()) {
      event.preventDefault();
      this.goPrev();
    } else if (event.key === 'ArrowRight' && this.hasNext()) {
      event.preventDefault();
      this.goNext();
    }
  }

  onImageClick(event: MouseEvent): void {
    if (this.isDragging()) return;
    if (this.isZoomed()) {
      this.resetZoom();
    } else {
      this.zoomScale.set(2);
    }
  }

  onImageDblClick(_event: MouseEvent): void {
    this.resetZoom();
  }

  onWheel(event: WheelEvent): void {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.25 : 0.25;
    this.zoomScale.update(s => Math.max(0.5, Math.min(4, s + delta)));
  }

  onMouseDown(event: MouseEvent): void {
    if (!this.isZoomed()) return;
    event.preventDefault();
    this.isDragging.set(true);
    this.dragStart = { x: event.clientX, y: event.clientY, panX: this.panX(), panY: this.panY() };
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging()) return;
    const dx = event.clientX - this.dragStart.x;
    const dy = event.clientY - this.dragStart.y;
    this.panX.set(this.dragStart.panX + dx);
    this.panY.set(this.dragStart.panY + dy);
  }

  onMouseUp(_event: MouseEvent): void {
    this.isDragging.set(false);
  }

  onTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.touchStartX = event.touches[0].pageX;
      this.touchStartY = event.touches[0].pageY;
      this.touchStartTime = Date.now();
    }
  }

  onTouchEnd(event: TouchEvent): void {
    if (event.changedTouches.length !== 1) return;
    if (this.isZoomed()) return;

    const dx = event.changedTouches[0].pageX - this.touchStartX;
    const dy = event.changedTouches[0].pageY - this.touchStartY;
    const elapsed = Date.now() - this.touchStartTime;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && elapsed < 300) {
      if (dx > 0 && this.hasPrev()) {
        this.resetZoom();
        this.goPrev();
      } else if (dx < 0 && this.hasNext()) {
        this.resetZoom();
        this.goNext();
      }
    }
  }

  resetZoom(): void {
    this.zoomScale.set(1);
    this.panX.set(0);
    this.panY.set(0);
  }
}
