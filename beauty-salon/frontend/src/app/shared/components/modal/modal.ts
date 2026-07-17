import { Component, ElementRef, inject, input, output, effect, DestroyRef } from '@angular/core';
import type { ModalSize } from './modal.types';

let modalIdCounter = 0;

/**
 * Modal accesible con backdrop, focus trap, scroll lock y <ng-content>.
 *
 * Se abre/cierra mediante el input `open`. Cierra al hacer click
 * en el backdrop, presionar Escape o clickear el botón de cierre.
 * Incluye focus trap (Tab/Shift+Tab cíclico dentro del panel),
 * focus restoration (vuelve al elemento que abrió el modal),
 * y body scroll lock mientras esté abierto.
 *
 * @usage
 * ```html
 * <!-- Básico -->
 * <app-modal [open]="isOpen()" title="Nuevo turno" (close)="onClose()">
 *   <app-formulario-turno />
 * </app-modal>
 *
 * <!-- Pantalla completa -->
 * <app-modal [open]="isOpen()" fullscreen title="Galería" (close)="onClose()">
 *   <app-gallery [images]="images" />
 * </app-modal>
 *
 * <!-- Persistente (solo cierre explícito) -->
 * <app-modal [open]="isOpen()" persistent closable="false" title="Procesando...">
 *   <app-loading variant="spinner" label="Guardando cambios…" />
 * </app-modal>
 * ```
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  host: { class: 'app-modal' },
})
export class Modal {
  /** Abre o cierra el modal. */
  readonly open = input(false);

  /** Título del modal. Se renderiza como <h2> y se vincula via aria-labelledby. */
  readonly title = input<string>();

  /** Tamaño del panel: sm (24rem), md (32rem), lg (40rem). @default 'md' */
  readonly size = input<ModalSize>('md');

  /** Modo pantalla completa. Sobreescribe `size` cuando está activo. */
  readonly fullscreen = input(false);

  /** Muestra el botón ✕ de cierre. @default true */
  readonly closable = input(true);

  /** Evita cierre por backdrop click y Escape.
   *  El botón ✕ sigue funcionando si `closable` es true. @default false */
  readonly persistent = input(false);

  /** ARIA label para el dialog (fallback cuando no hay `title`). */
  readonly ariaLabel = input<string>();

  /** Label para el botón de cerrar (lectores de pantalla). @default 'Cerrar' */
  readonly closeLabel = input('Cerrar');

  /** Se emite al cerrar. */
  readonly close = output<void>();

  readonly titleId = `modal-title-${++modalIdCounter}`;

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private previousFocus?: HTMLElement;

  constructor() {
    effect(() => {
      if (this.open()) {
        this.openModal();
      } else {
        this.closeModal();
      }
    });

    this.destroyRef.onDestroy(() => {
      document.body.style.overflow = '';
    });
  }

  // ── Lifecycle ────────────────────────────────────────────────

  private openModal(): void {
    this.previousFocus = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';

    // Deferred: espera a que el DOM (creado por @if) esté montado
    setTimeout(() => {
      this.focusFirst();
    });
  }

  private closeModal(): void {
    document.body.style.overflow = '';
    this.previousFocus?.focus();
    this.previousFocus = undefined;
  }

  // ── Focus ────────────────────────────────────────────────────

  private focusFirst(): void {
    const panel = this.host.nativeElement.querySelector<HTMLElement>('.modal-panel');
    if (!panel) return;
    const first = this.getFocusable(panel)[0];
    if (first) {
      first.focus();
    } else {
      panel.focus();
    }
  }

  /** Cicla el foco dentro del panel. */
  private trapTab(event: KeyboardEvent): void {
    const panel = this.host.nativeElement.querySelector<HTMLElement>('.modal-panel');
    if (!panel) return;

    const focusable = this.getFocusable(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && event.target === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && event.target === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusable(parent: HTMLElement): HTMLElement[] {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(parent.querySelectorAll<HTMLElement>(selector));
  }

  // ── Handlers ─────────────────────────────────────────────────

  onBackdropClick(event: MouseEvent): void {
    if (this.persistent()) return;

    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && !this.persistent()) {
      this.close.emit();
      return;
    }

    if (event.key === 'Tab') {
      this.trapTab(event);
    }
  }
}
