import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforma minutos a formato legible "X h Y min" o "X min".
 *
 * @usage
 * ```html
 * <span>{{ 45 | duration }}</span>       → "45 min"
 * <span>{{ 90 | duration }}</span>       → "1 h 30 min"
 * <span>{{ 120 | duration }}</span>      → "2 h"
 * <span>{{ 0 | duration }}</span>        → "0 min"
 * ```
 */
@Pipe({
  name: 'duration',
  standalone: true,
})
export class DurationPipe implements PipeTransform {
  transform(minutes: number | string): string {
    const m = typeof minutes === 'string' ? Number.parseInt(minutes, 10) : minutes;

    if (Number.isNaN(m) || m < 0) return '—';

    if (m < 60) return `${m} min`;

    const hours = Math.floor(m / 60);
    const rest = m % 60;

    if (rest === 0) return `${hours} h`;
    return `${hours} h ${rest} min`;
  }
}
