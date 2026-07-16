import { Pipe, PipeTransform } from '@angular/core';

/**
 * Acorta un texto a `maxLength` caracteres, agregando
 * un sufijo (por defecto "…") si fue truncado.
 *
 * @usage
 * ```html
 * <p>{{ description | truncate:120 }}</p>
 * <p>{{ description | truncate:80:'...' }}</p>
 * ```
 */
@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(
    value: string,
    maxLength: number = 100,
    suffix: string = '…',
  ): string {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return value.slice(0, maxLength).trimEnd() + suffix;
  }
}
