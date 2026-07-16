import { Component, inject } from '@angular/core';
import { CtaButton } from '../../shared';
import { BusinessInfoService } from '../../services/features/business-info/business-info.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CtaButton],
  host: { class: 'section-padding' },
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class AboutComponent {
  private readonly businessInfoService = inject(BusinessInfoService);

  /** Signal directa desde BusinessInfoService */
  readonly data = this.businessInfoService.data;

  onCtaClick(): void {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
  }
}
