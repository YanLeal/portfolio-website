/**
 * Badge genérico para cualquier entidad que necesite metadata
 * promocional o informativa (servicios, promociones, equipo,
 * blog, eventos, cupones, etc.).
 *
 * Cada dominio puede tipar `id` con sus propios valores literales
 * sin perder compatibilidad con el componente <app-badge>.
 *
 * @example
 * // Service
 * { id: 'new', label: 'Nuevo', priority: 10, color: 'success' }
 *
 * @example
 * // Team
 * { id: 'specialist', label: 'Especialista', priority: 10, color: 'primary' }
 *
 * @example
 * // Blog
 * { id: 'updated', label: 'Actualizado', priority: 20, color: 'accent' }
 */
export interface Badge {
  /** Identificador semántico único dentro de la entidad.
   *  Tipo abierto (string) para flexibilidad cross-dominio. */
  readonly id: string;

  /** Texto visible del badge. Se define en los datos para
   *  permitir cambios sin tocar código. */
  readonly label: string;

  /** Prioridad de aparición (menor número = primera posición). */
  readonly priority: number;

  /** Clave del design system para el color de fondo. */
  readonly color: string;

  /** Icono opcional. Debe ser un nombre válido de SvgIcon. */
  readonly icon?: string;
}

/** Colores del sistema para el componente Badge.
 *  Mapean a variables CSS del design system (`--color-*`). */
export type BadgeColor =
  | 'primary'    /* → --color-primary    (rosa elegante) */
  | 'secondary'  /* → --color-secondary  (borgoña) */
  | 'success'    /* → --color-success    (verde salvia) */
  | 'warning'    /* → --color-warning    (amarillo) */
  | 'danger'     /* → --color-error      (rojo) */
  | 'neutral'    /* → --color-neutral-500 */
  | 'accent'     /* → --color-accent     (dorado) */
  | 'brand';     /* → --color-primary    (alias de primary) */

/** Variantes visuales del Badge. */
export type BadgeVariant = 'filled' | 'outlined' | 'subtle';

/** Tamaños predefinidos del Badge. */
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

/** Animaciones de entrada/sostenidas del Badge.
 *  - `fadeIn`:   opacidad 0 → 1 (default, una vez al montar)
 *  - `pulse`:    escala 1 → 1.06 → 1 (loop infinito, atención)
 *  - `scaleIn`:  escala 0.85 + opacidad 0 → 1 (una vez al montar)
 *  - `slideIn`:  translateX(-0.5rem) + opacidad 0 → 0 (una vez al montar) */
export type BadgeAnim = 'fadeIn' | 'pulse' | 'scaleIn' | 'slideIn';
