import { Injectable } from '@angular/core';

const LOCALE = 'es-AR';

@Injectable({ providedIn: 'root' })
export class DateService {
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return date.toLocaleDateString(LOCALE, options);
  }

  formatTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
    return date.toLocaleTimeString(LOCALE, options);
  }

  formatRelative(date: Date): string {
    const now = Date.now();
    const diff = date.getTime() - now;
    const minutes = Math.round(diff / 60_000);
    const hours = Math.round(diff / 3_600_000);
    const days = Math.round(diff / 86_400_000);

    if (Math.abs(minutes) < 60) return minutes >= 0 ? `en ${minutes} min` : `hace ${Math.abs(minutes)} min`;
    if (Math.abs(hours) < 24) return hours >= 0 ? `en ${hours} h` : `hace ${Math.abs(hours)} h`;
    return days >= 0 ? `en ${days} días` : `hace ${Math.abs(days)} días`;
  }
}
