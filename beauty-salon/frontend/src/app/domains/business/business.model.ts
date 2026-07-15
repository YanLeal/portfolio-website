// ─── Día de la semana ────────────────────────────────

/** Día de la semana, ISO (lunes = primer día). Usa inglés para
 *  serialización predecible y consistencia con estándares web. */
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

// ─── Bloque de horario ───────────────────────────────

/**
 * Bloque único de horario con inicio y fin en formato 24h.
 *
 * Un día puede tener 0, 1 o N bloques:
 * - 0 bloques  → día cerrado
 * - 1 bloque   → horario continuo (ej: 09:00–19:00)
 * - 2 bloques  → dos turnos (ej: mañana 09:00–13:00, tarde 16:00–20:00)
 * - 3+ bloques → múltiples bloques (ej: consultas cada 2h)
 */
export interface BusinessHours {
  /** Hora de inicio en formato 24h HH:mm. Ej: "09:00" */
  readonly start: string;
  /** Hora de fin en formato 24h HH:mm. Ej: "19:00" */
  readonly end: string;
}

// ─── Día del negocio ─────────────────────────────────

/**
 * Representa UN día específico de la semana con sus horarios.
 *
 * Separa explícitamente el día (BusinessDay) del rango horario
 * (BusinessHours) para que cada uno tenga una responsabilidad única
 * y puedan componerse de forma independiente.
 *
 * @example
 * // Lunes abierto todo el día
 * { day: 'monday', shifts: [{ start: '09:00', end: '19:00' }] }
 *
 * @example
 * // Domingo cerrado
 * { day: 'sunday', shifts: [] }
 *
 * @example
 * // Martes con dos turnos
 * { day: 'tuesday', shifts: [
 *   { start: '09:00', end: '13:00' },
 *   { start: '16:00', end: '20:00' },
 * ]}
 */
export interface BusinessDay {
  /** Día de la semana al que aplica este horario */
  readonly day: DayOfWeek;

  /**
   * Bloques de horario del día.
   * Vacío ([]) = día cerrado.
   */
  readonly shifts: readonly BusinessHours[];

  /**
   * Nota opcional visible para el cliente.
   *
   * Ej: "Solo con cita previa", "Cerrado por mantenimiento".
   * Se renderiza junto al horario, no es un comentario interno.
   */
  readonly note?: string;
}

// ─── Semana completa ─────────────────────────────────

/**
 * Horarios de atención semanales del negocio.
 *
 * La estructura separa el horario regular (se repite todas las semanas)
 * de las excepciones (días puntuales que lo sobrescriben).
 */
export interface WeeklySchedule {
  /**
   * Horario base de la semana.
   *
   * Normalmente 7 entradas (lunes a domingo).
   * Si un día no está en el array, se asume cerrado.
   */
  readonly regular: readonly BusinessDay[];

  /**
   * Excepciones para fechas específicas (festivos, horarios especiales).
   *
   * Campo preparado para futura implementación. Mientras esté undefined
   * o vacío, el frontend usa solo `regular`.
   */
  readonly exceptions?: readonly ScheduleException[];
}

// ─── Excepción de horario (futuro) ───────────────────

/**
 * Excepción puntual que sobrescribe el horario regular para una fecha.
 *
 * @example
 * // Navidad: cerrado
 * { date: '2026-12-25', type: 'closed', reason: 'Navidad' }
 *
 * @example
 * // Víspera de Navidad: horario reducido
 * { date: '2026-12-24', type: 'special_hours',
 *   shifts: [{ start: '09:00', end: '14:00' }],
 *   reason: 'Víspera de Navidad' }
 */
export interface ScheduleException {
  /** Fecha ISO (YYYY-MM-DD) a la que aplica la excepción */
  readonly date: string;

  /**
   * Tipo de excepción:
   * - 'closed': cerrado todo el día (no usa `shifts`)
   * - 'special_hours': horario distinto al regular (usa `shifts`)
   * - 'extended_hours': horario extendido (usa `shifts`)
   */
  readonly type: 'closed' | 'special_hours' | 'extended_hours';

  /** Bloques de horario para esta excepción (solo si type ≠ 'closed') */
  readonly shifts?: readonly BusinessHours[];

  /** Motivo visible para el cliente. Ej: "Navidad", "Mantenimiento" */
  readonly reason: string;
}

// ─── Datos de contacto ───────────────────────────────

export interface BusinessPhone {
  readonly display: string;
  readonly tel: string;
}

export interface BusinessSocial {
  readonly instagram: string;
  readonly facebook: string;
}

export interface BusinessContact {
  readonly phone: BusinessPhone;
  readonly whatsapp: string;
  readonly email: string;
  readonly address: string;
  readonly mapUrl?: string;
  readonly social: BusinessSocial;

  /**
   * Horarios de atención semanales.
   *
   * Migrado del formato plano `BusinessScheduleEntry[]` a `WeeklySchedule`
   * para soportar horarios por día, múltiples turnos, días cerrados y
   * futuras excepciones (festivos, horarios especiales).
   */
  readonly schedule: WeeklySchedule;
}

// ─── Site / SEO / Config ─────────────────────────────

export interface BusinessSite {
  readonly name: string;
  readonly url: string;
  readonly description: string;
  readonly logo?: string;
}

export interface BusinessSeo {
  readonly title: string;
  readonly description: string;
  readonly ogImage: string;
  readonly ogLocale: string;
  readonly canonical: string;
}

export interface BusinessConfig {
  readonly site: BusinessSite;
  readonly contact: BusinessContact;
  readonly seo: BusinessSeo;
}
