import type { ResultCategory } from './result.types';

/**
 * Resultado antes/después de un servicio o tratamiento.
 *
 * Cada entrada representa un caso real documentado con fotografía
 * del estado inicial y final, pensado para el slider comparativo
 * de la sección galería / resultados.
 */
export interface Result {
  /** Identificador único. Se usa en @for, tracking, URLs. */
  readonly id: string;

  /** Título corto del resultado (ej: "Corte + Coloración"). */
  readonly title: string;

  /** Descripción del procedimiento, productos usados o detalle del resultado. */
  readonly description: string;

  /** Ruta a la imagen del estado inicial (antes). */
  readonly beforeImage: string;

  /** Ruta a la imagen del estado final (después). */
  readonly afterImage: string;

  /** Categoría del resultado para filtrar (cabello, uñas, etc.). */
  readonly category: ResultCategory;

  /** Si es true, aparece destacado en la sección principal o en el hero de resultados. */
  readonly featured: boolean;

  /** Orden de visualización. Menor valor = aparece primero. */
  readonly order: number;
}
