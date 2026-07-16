import { Component, computed, input, output } from '@angular/core';
import { SvgIcon } from '../svg-icon/svg-icon';
import type { BadgeColor, BadgeVariant, BadgeSize, SvgIconName, BadgeAnim } from '../../types';
import type { Badge as BadgeData } from '../../types/badge.types';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [SvgIcon],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
  host: { class: 'app-badge' },
})
/**
 * Badge reutilizable con variantes de color, tamaño e interacción.
 *
 * Soporta API dual:
 *   - Inputs individuales: label, color, variant, size, icon
 *   - Objeto dato: `[badge]="{ label, color, icon }"` (compatible con tipos de dominio)
 *
 * Modos de interacción:
 *   - `selectable` → toggle on/off con `aria-pressed`
 *   - `removable`  → botón × que emite `removed`
 *   - `clickable`  → emite `clicked` al hacer click
 *
 * @usage
 * ```html
 * <!-- Simple -->
 * <app-badge label="Nuevo" color="success" size="sm" />
 *
 * <!-- Desde objeto (backward compat) -->
 * <app-badge [badge]="{ label: '20% OFF', color: 'primary', icon: 'sparkles' }" />
 *
 * <!-- Selectable (toggle) -->
 * <app-badge label="Corte" selectable [selected]="isSelected" (toggled)="onFilter($event)" />
 *
 * <!-- Removable -->
 * <app-badge label="Servicio" removable (removed)="removeFilter($event)" />
 *
 * <!-- Outlined -->
 * <app-badge label="Outlined" variant="outlined" color="warning" />
 * ```
 */
export class Badge {
  // ── Data sources (dual API) ──────────────────────────────────
  /** Objeto completo Badge (compatible con datos de dominio).
   *  Los inputs individuales sobreescriben las propiedades de este objeto. */
  readonly badge = input<BadgeData>();

  /** Label directo. Si no se pasa, se extrae de `badge.label`. */
  readonly label = input<string>();

  /** Color del badge. Si no se pasa, se extrae de `badge.color`.
   *  @default 'primary' */
  readonly color = input<BadgeColor>();

  /** Variante visual. @default 'filled' */
  readonly variant = input<BadgeVariant>();

  /** Tamaño del badge. @default 'md' */
  readonly size = input<BadgeSize>();

  /** Icono opcional a la izquierda del label (lucide/feather). Si no se pasa, se extrae de `badge.icon`. */
  readonly icon = input<SvgIconName>();

  /** Icono opcional a la derecha del label, antes del botón ×. Útil para chevrons,
   *  arrows, o indicadores visuales. No se hereda de `badge.icon`. */
  readonly iconAfter = input<SvgIconName>();

  /** Borde redondeado completo (pill). Si `false`, usa radio pequeño. @default true */
  readonly rounded = input(true);

  /** Animación opcional. Acepta nombre de animación o boolean.
   *  - `true` / `'fadeIn'`  → fadeIn al montar (default)
   *  - `'pulse'`            → pulse infinito (atención/notificación)
   *  - `'scaleIn'`          → escala + fadeIn al montar
   *  - `'slideIn'`          → slide desde izquierda al montar
   *  - `false`              → sin animación
   *
   *  @default true (fadeIn) */
  readonly anim = input<boolean | BadgeAnim>();

  /** @deprecated Usar `anim` en su lugar. Mantenido para compatibilidad. */
  readonly animated = input(true);

  // ── Interacción ──────────────────────────────────────────────
  /** Modo seleccionable (toggle). El badge se comporta como un
   *  botón con `aria-pressed` y emite `toggled` al clickear. */
  readonly selectable = input(false);

  /** Muestra botón × que emite `removed`. Combinable con otros modos. */
  readonly removable = input(false);

  /** Modo clickable. Emite `clicked` con el id/label al clickear. */
  readonly clickable = input(false);

  /** Estado seleccionado (solo para modo `selectable`). */
  readonly selected = input(false);

  // ── Outputs ──────────────────────────────────────────────────
  /** Emitido en modo `clickable`. Valor: badge.id o resolvedLabel. */
  readonly clicked = output<string>();

  /** Emitido al presionar × en modo `removable`. Valor: badge.id o resolvedLabel. */
  readonly removed = output<string>();

  /** Emitido en modo `selectable` al cambiar estado. Valor: nuevo estado. */
  readonly toggled = output<boolean>();

  // ── Resolved ─────────────────────────────────────────────────
  /** Label final: prioriza input directo, luego badge.label, luego ''. */
  readonly resolvedLabel = computed(() => this.label() ?? this.badge()?.label ?? '');

  /** Color final: prioriza input directo, luego badge.color, luego 'brand'. */
  readonly resolvedColor = computed(() => this.color() ?? this.badge()?.color ?? 'primary');

  /** Variante final: prioriza input directo, luego 'filled'. */
  readonly resolvedVariant = computed<BadgeVariant>(() => this.variant() ?? 'filled');

  /** Tamaño final: prioriza input directo, luego 'md'. */
  readonly resolvedSize = computed<BadgeSize>(() => this.size() ?? 'md');

  /** Icono final (izquierda): prioriza input directo, luego badge.icon, luego undefined. */
  readonly resolvedIcon = computed<SvgIconName | undefined>(
    () => this.icon() ?? this.badge()?.icon as SvgIconName | undefined,
  );

  /** Icono final (derecha): solo input directo, nunca se hereda de badge. */
  readonly resolvedIconAfter = computed<SvgIconName | undefined>(() => this.iconAfter());

  /** Animación resuelta: prioriza `anim`, luego `animated` legacy.
   *  Retorna el nombre de la animación o undefined si desactivada. */
  readonly resolvedAnim = computed<BadgeAnim | undefined>(() => {
    const anim = this.anim();
    if (anim === false) return undefined;
    if (anim === 'fadeIn' || anim === 'pulse' || anim === 'scaleIn' || anim === 'slideIn') return anim;
    // anim es true, undefined, o no es un string válido — fallback a legacy animated
    return this.animated() ? 'fadeIn' : undefined;
  });

  /** ID para outputs: prioriza badge.id, luego resolvedLabel. */
  readonly resolvedId = computed(() => this.badge()?.id ?? this.resolvedLabel());

  /** Es interactivo? (clickable o selectable) — determina si renderiza <button>. */
  readonly isInteractive = computed(() => this.selectable() || this.clickable());

  /** Tamaño del icono según el size del badge. */
  readonly iconSize = computed(() => {
    switch (this.resolvedSize()) {
      case 'xs': return 8;
      case 'sm': return 10;
      case 'lg': return 16;
      default: return 12;
    }
  });

  // ── Handlers ─────────────────────────────────────────────────
  onClick(): void {
    if (this.selectable()) {
      this.toggled.emit(!this.selected());
    } else if (this.clickable()) {
      this.clicked.emit(this.resolvedId());
    }
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    this.removed.emit(this.resolvedId());
  }
}
