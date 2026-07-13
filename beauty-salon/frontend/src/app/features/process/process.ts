import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { SvgIcon } from '../../shared/components/svg-icon/svg-icon';
import { ProcessService } from '../../core/services/process.service';
import { ConfigService } from '../../core/services/config.service';

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [SectionHeader, SvgIcon],
  templateUrl: './process.html',
  styleUrl: './process.css',
})
export class ProcessComponent {
  private readonly processService = inject(ProcessService);
  private readonly configService = inject(ConfigService);
  readonly steps = toSignal(this.processService.getAll(), { initialValue: [] });
  readonly hasError = this.processService.error;
  readonly processTitle = computed(() => this.configService.config()?.sections.process.title ?? 'Nuestro proceso');
  readonly processSubtitle = computed(() => this.configService.config()?.sections.process.subtitle ?? 'Tu experiencia en 4 pasos');
}
