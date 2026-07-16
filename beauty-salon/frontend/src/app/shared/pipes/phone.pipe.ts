import { Pipe, PipeTransform } from '@angular/core';

/**
 * Formatea un número de teléfono argentino para display.
 *
 * Soporta:
 * - `5491123456789` → `(11) 2345-6789`
 * - `1123456789`    → `(11) 2345-6789`
 * - `2212345678`    → `(221) 234-5678`
 *
 * @usage
 * ```html
 * <span>{{ '5491123456789' | phone }}</span>
 * <span>{{ whatsappNumber | phone }}</span>
 * ```
 */
@Pipe({
  name: 'phone',
  standalone: true,
})
export class PhonePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    // Sacar código de país 549 si está presente (Argentina WhatsApp)
    const cleaned = value.replace(/^549(\d{3,})/, '$1');

    // Buenos Aires (11 + 8 dígitos)
    if (/^11(\d{8})$/.test(cleaned)) {
      return cleaned.replace(/^11(\d{4})(\d{4})$/, '(11) $1-$2');
    }

    // Resto del país: código de área (3 dígitos) + 7 dígitos
    if (/^\d{3}\d{7}$/.test(cleaned)) {
      return cleaned.replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');
    }

    // Celulares: código de área (2 dígitos, ej: 11) + 8 dígitos sin el 11
    if (/^\d{2}\d{8}$/.test(cleaned)) {
      return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
    }

    return value;
  }
}
