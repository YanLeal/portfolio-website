import { Component, computed, inject, signal } from '@angular/core';
import type { FaqCategory, FaqItem as FaqItemModel } from '../../domains/faq/faq.model';
import { FaqItem, EmptyState, RevealDirective, SectionHeader } from '../../shared';
import { FaqService } from '../../domains/faq/faq.service';
import { ContentService } from '../../domains/content/content.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [FaqItem, EmptyState, SectionHeader, RevealDirective],
  templateUrl: './faq.html',
  styleUrl: './faq.css',
})
export class FaqComponent {
  private readonly service = inject(FaqService);
  private readonly contentService = inject(ContentService);

  readonly categorias = this.service.categorias;
  readonly categoriaSeleccionada = signal<string | null>(null);
  readonly searchText = signal('');
  readonly faqAbierta = signal<string | null>(null);

  readonly faqs = computed(() => this.service.faqsOrdenadas());

  readonly noResultsContent = computed(() => this.contentService.data().emptyState.noResults);

  readonly hayResultados = computed(() =>
    this.faqs().some((f) => this.coincideConFiltro(f)),
  );

  coincideConFiltro(item: FaqItemModel): boolean {
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
