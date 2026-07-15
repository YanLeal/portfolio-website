export type PromotionStatus = 'draft' | 'scheduled' | 'active' | 'expired';

export interface Promotion {
  readonly id: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly description: string;
  readonly image: string;
  readonly buttonLabel: string;
  readonly buttonUrl: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly priority: number;
  readonly status: PromotionStatus;
  readonly badge?: string;
  readonly theme?: 'primary' | 'secondary' | 'accent' | 'dark';
}

const SALON_TIMEZONE = 'America/Mexico_City';

/** Obtiene la fecha actual del salón como string ISO (YYYY-MM-DD)
 *  respetando la zona horaria de México CDMX. */
function getFechaSalon(date: Date = new Date()): string {
  return date.toLocaleDateString('en-CA', { timeZone: SALON_TIMEZONE });
}

/** Determina si una promoción está vigente en una fecha dada.
 *  La fecha de referencia por defecto es el momento actual en CDMX.
 *  Una promo está vigente si:
 *  - Su estado es 'active'
 *  - La fecha de referencia está dentro del rango [startDate, endDate] */
export function isPromocionVigente(
  promo: Promotion,
  referenceDate: Date = new Date(),
): boolean {
  const ref = getFechaSalon(referenceDate);
  return (
    promo.status === 'active' &&
    promo.startDate <= ref &&
    promo.endDate >= ref
  );
}
