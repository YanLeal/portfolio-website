import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { ProcessService } from '../../core/services/process.service';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [SectionHeader, SvgIcon],
  templateUrl: './process.html',
  styleUrl: './process.css',
})
export class ProcessComponent {
  private readonly processService = inject(ProcessService);
  readonly steps = toSignal(this.processService.getAll(), { initialValue: [] });
}
