import { Component, input, output } from '@angular/core';

/**
 * Modal accesible con backdrop, botón de cierre y <ng-content>.
 *
 * Se abre/cierra mediante el input `open`. Cierra al hacer click
 * en el backdrop o presionar Escape. Incluye ARIA completo para
 * lectores de pantalla (role="dialog", aria-modal, aria-label).
 *
 * @usage
 * ```html
 * <app-modal [open]="isOpen()" ariaLabel="Confirmar turno" (close)="onClose()">
 *   <h2>¿Confirmás el turno?</h2>
 *   <p>Fecha: 15/07 a las 16:00 hs</p>
 *   <button (click)="onConfirm()">Confirmar</button>
 * </app-modal>
 * ```
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  /** Abre o cierra el modal. */
  readonly open = input(false);

  /** ARIA label opcional. Si no se provee, se omite en el dialog. */
  readonly ariaLabel = input<string>();

  /** Se emite al cerrar (backdrop click, Escape, botón cerrar). */
  readonly close = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close.emit();
    }
  }
}
