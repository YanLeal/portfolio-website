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
 * { id: 'specialist', label: 'Especialista', priority: 10, color: 'brand' }
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

  /** Clave del design system para el color de fondo.
   *  El CSS mapea estos valores a variables de color.
   *  Ej: 'brand' | 'success' | 'accent' | 'neutral' | 'warning' */
  readonly color: string;

  /** Icono opcional. Debe ser un nombre válido de svg-icon. */
  readonly icon?: string;
}
