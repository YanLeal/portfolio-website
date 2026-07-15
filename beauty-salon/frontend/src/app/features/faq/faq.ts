import { Component, computed, inject, signal } from '@angular/core';
import type { FaqCategory, FaqItem } from '../../domains/faq/faq.model';
import { FaqItemComponent } from '../../shared/components/faq-item/faq-item';
import { SectionHeader } from '../../shared/components/section-header/section-header';
import { RevealDirective } from '../../shared/directives/reveal.directive';
import { FaqService } from '../../domains/faq/faq.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [FaqItemComponent, SectionHeader, RevealDirective],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class FaqComponent {
  private readonly service = inject(FaqService);

  readonly categorias = this.service.categorias;
  readonly categoriaSeleccionada = signal<string | null>(null);
  readonly searchText = signal('');
readonly faqAbierta = signal<string | null>(null);

  readonly faqs = computed(() => this.service.faqsOrdenadas());

  readonly hayResultados = computed(() =>
    this.faqs().some((f) => this.coincideConFiltro(f)),
  );

  coincideConFiltro(item: FaqItem): boolean {
    const cat = this.categoriaSeleccionada();
    const texto = this.searchText().toLowerCase().trim();
    if (cat && item.category !== cat) return false;
    if (texto) {
      return (
        item.question.toLowerCase().includes(texto) ||
        item.answer.toLowerCase().includes(texto) ||
        item.category.toLowerCase().includes(texto)
      );
    }
    return true;
  }

  seleccionar(cat: string | null): void {
    this.categoriaSeleccionada.set(cat);
  }

  toggleFaq(id: string): void {
    this.faqAbierta.update((actual) => (actual === id ? null : id));
  }
}
