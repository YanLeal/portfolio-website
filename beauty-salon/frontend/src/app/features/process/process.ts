import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ErrorBoundary, SectionHeader, SvgIcon } from '../../shared';
import { ProcessService } from '../../domains/process/process.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [ErrorBoundary, SectionHeader, SvgIcon],
  templateUrl: './process.html',
  styleUrl: './process.css',
})
export class ProcessComponent {
  private readonly processService = inject(ProcessService);
  private readonly contentService = inject(ContentService);
  readonly steps = toSignal(this.processService.getAll(), { initialValue: [] });
  readonly hasError = this.processService.error;
  readonly processTitle = computed(() => this.contentService.data().process.title);
  readonly processSubtitle = computed(() => this.contentService.data().process.subtitle);
}
