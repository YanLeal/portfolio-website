import { computed, inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import type { BusinessConfig, BusinessDay, BusinessHours, DayOfWeek, WeeklySchedule, ScheduleException } from './business.model';

/** Zona horaria del salón. Todas las fechas se evalúan en este huso. */
const SALON_TIMEZONE = 'America/Mexico_City';

const FALLBACK: BusinessConfig = {
  site: { name: '', url: '', description: '', logo: '' },
  contact: {
    phone: { display: '', tel: '' },
    whatsapp: '',
    email: '',
    address: '',
    social: { instagram: '', facebook: '' },
    schedule: { regular: [] },
  },
  seo: {
    title: '',
    description: '',
    ogImage: '',
    ogLocale: 'es_AR',
    canonical: '',
  },
};

@Injectable({ providedIn: 'root' })
export class BusinessService {
  private readonly http = inject(HttpClient);

  private readonly data$ = this.http
    .get<BusinessConfig>('assets/data/business/business.json')
    .pipe(
      shareReplay(1),
      catchError(() => {
        console.error('[BusinessService] Error loading business.json');
        return of(FALLBACK);
      }),
    );

  readonly data = toSignal(this.data$, { initialValue: FALLBACK });

  // ─── Horarios ─────────────────────────────────────

  /** Signal con el objeto completo de horarios (regular + excepciones). */
  readonly schedule = computed<WeeklySchedule>(() => this.data().contact.schedule);

  /** Signal con el array de horarios regulares (lunes a domingo). */
  readonly regularSchedule = computed<readonly BusinessDay[]>(() => this.schedule().regular);

  /** Signal con las excepciones (festivos, horarios especiales), o undefined. */
  readonly exceptions = computed<readonly ScheduleException[] | undefined>(
    () => this.schedule().exceptions,
  );

  /**
   * Busca el horario de un día específico en la semana regular.
   *
   * @returns El BusinessDay si existe, o undefined si el día no está definido.
   *
   * @example
   * const hoy = businessService.getDaySchedule('monday');
   * // hoy?.shifts, hoy?.note
   */
  getDaySchedule(day: DayOfWeek): BusinessDay | undefined {
    return this.regularSchedule().find((d) => d.day === day);
  }

  // ─── Formato para display ─────────────────────────

  /** Traducción de DayOfWeek a español para mostrar en la UI. */
  private static readonly DAY_LABELS: Record<DayOfWeek, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  /**
   * Horario semanal listo para consumo directo en templates.
   *
   * Transforma `BusinessDay[]` en un array de objetos con:
   * - `label`: nombre del día en español
   * - `hours`: string formateada ("09:00 – 19:00", "Cerrado", o "09:00 – 14:00 / 16:00 – 21:00")
   * - `isClosed`: boolean para lógica condicional en el template
   * - `day`: el identificador original (útil para track, ordenamiento)
   * - `note`: nota opcional, si existe
   *
   * @example
   * // Día con turno continuo
   * { day: 'monday', label: 'Lunes', hours: '09:00 – 19:00', isClosed: false }
   *
   * @example
   * // Día con dos turnos (siesta)
   * { day: 'friday', label: 'Viernes', hours: '09:00 – 14:00 / 16:00 – 21:00', isClosed: false }
   *
   * @example
   * // Día cerrado
   * { day: 'sunday', label: 'Domingo', hours: 'Cerrado', isClosed: true }
   */
  readonly businessHours = computed(() =>
    this.regularSchedule().map((day) => ({
      day: day.day,
      label: BusinessService.DAY_LABELS[day.day],
      hours:
        day.shifts.length === 0
          ? 'Cerrado'
          : day.shifts
              .map((s) => `${s.start} – ${s.end}`)
              .join(' / '),
      isClosed: day.shifts.length === 0,
      ...(day.note ? { note: day.note } : {}),
    })),
  );

  /** Mapa de getDay() (0=domingo) → DayOfWeek */
  private static readonly JS_DAY_MAP: readonly DayOfWeek[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];

  /** Obtiene la fecha actual en CDMX como ISO YYYY-MM-DD. */
  private getTodayDate(): { dateStr: string; dayOfWeek: DayOfWeek } {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-CA', {
      timeZone: SALON_TIMEZONE,
    });
    // getDay() en el objeto Date original puede diferir del día en CDMX
    // si la hora local cruza la medianoche en el huso del salón. Usamos
    // el día que corresponde a la fecha CDMX.
    const dayIndex = new Date(dateStr + 'T12:00:00').getDay();
    return { dateStr, dayOfWeek: BusinessService.JS_DAY_MAP[dayIndex] };
  }

  /**
   * Horario correspondiente al día de hoy, combinando la semana regular
   * con las excepciones (festivos, horarios especiales).
   *
   * Lógica de resolución:
   *
   * 1. Obtiene la fecha actual en CDMX (America/Mexico_City) usando
   *    `Intl.DateTimeFormat` con timezone explícito, no `toISOString()`,
   *    para evitar desfase UTC.
   * 2. Busca si existe una excepción para la fecha de hoy.
   *    - `type === 'closed'` → devuelve `isClosed: true` con `reason`.
   *    - `type === 'special_hours'` o `'extended_hours'` → usa los
   *      horarios de la excepción, marca `isException: true`.
   * 3. Sin excepción → busca el día en `regularSchedule`.
   *    - Si no está definido, devuelve `null`.
   *    - Si está definido, devuelve sus horarios.
   *
   * @returns Un objeto con la misma forma que los elementos de `businessHours`,
   *          más `isException` y `reason` si aplica, o `null` si el día de hoy
   *          no tiene ningún horario definido.
   *
   * @example
   * // Lunes cualquiera sin excepción
   * { day: 'monday', label: 'Lunes', hours: '09:00 – 19:00', isClosed: false, isException: false }
   *
   * @example
   * // 25 de diciembre (excepción closed)
   * { day: 'friday', label: 'Viernes', hours: 'Cerrado', isClosed: true, isException: true, reason: 'Navidad' }
   */
  /** Obtiene la hora actual en CDMX como string HH:mm. */
  private getCurrentTimeCDMX(): string {
    return new Date().toLocaleTimeString('en-GB', {
      timeZone: SALON_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  /**
   * Indica si el negocio está abierto en este momento.
   *
   * Lógica:
   * 1. Obtiene `todaySchedule` — si es `null` o `isClosed`, devuelve `false`.
   * 2. No asume que el día esté abierto aunque tenga shifts definidos.
   *    Compara la hora actual en CDMX contra cada bloque del día.
   * 3. Si la hora actual está dentro de ALGÚN bloque (start <= now < end),
   *    devuelve `true`.
   *
   * Usa el mismo huso horario que el resto del módulo (America/Mexico_City).
   * La comparación es lexicográfica sobre strings "HH:mm" (24h, zero-padded),
   * que es equivalente a comparar numéricamente minutos desde medianoche.
   *
   * @example
   * // Son las 15:30 en CDMX, hoy hay shift 09:00–19:00
   * isOpenNow() → true
   *
   * @example
   * // Son las 21:00 en CDMX, hoy hay shift 09:00–19:00
   * isOpenNow() → false
   *
   * @example
   * // Hoy es domingo (cerrado)
   * isOpenNow() → false
   */
  readonly isOpenNow = computed<boolean>(() => {
    const today = this.todaySchedule();
    if (!today || today.isClosed) return false;

    const now = this.getCurrentTimeCDMX();

    return today.shifts.some((s) => s.start <= now && now < s.end);
  });

  readonly todaySchedule = computed(() => {
    const { dateStr, dayOfWeek } = this.getTodayDate();

    // 1. Buscar excepción para hoy
    const exception = this.exceptions()?.find((ex) => ex.date === dateStr);

    if (exception) {
      if (exception.type === 'closed') {
        return {
          day: dayOfWeek,
          label: BusinessService.DAY_LABELS[dayOfWeek],
          date: dateStr,
          shifts: [] as readonly BusinessHours[],
          hours: 'Cerrado',
          isClosed: true,
          isException: true,
          reason: exception.reason,
        };
      }

      const shifts = exception.shifts ?? [];
      return {
        day: dayOfWeek,
        label: BusinessService.DAY_LABELS[dayOfWeek],
        date: dateStr,
        shifts,
        hours:
          shifts.length > 0
            ? shifts.map((s) => `${s.start} – ${s.end}`).join(' / ')
            : 'Cerrado',
        isClosed: shifts.length === 0,
        isException: true,
        reason: exception.reason,
      };
    }

    // 2. Sin excepción — buscar en horario regular
    const regular = this.regularSchedule().find((d) => d.day === dayOfWeek);
    if (!regular) return null;

    return {
      day: regular.day,
      label: BusinessService.DAY_LABELS[regular.day],
      shifts: regular.shifts,
      hours:
        regular.shifts.length === 0
          ? 'Cerrado'
          : regular.shifts
              .map((s) => `${s.start} – ${s.end}`)
              .join(' / '),
      isClosed: regular.shifts.length === 0,
      isException: false,
      ...(regular.note ? { note: regular.note } : {}),
    };
  });
}
