import { InjectionToken } from '@angular/core';

export interface SiteConfig {
  /** Nombre del negocio/sitio (ej: "Belleza & Estilo") */
  readonly name: string;
  /** Descripción corta del sitio */
  readonly description: string;
  /** URL del sitio */
  readonly url: string;
  /** Teléfono de contacto en formato display */
  readonly phone: string;
}

/**
 * Configuración general del sitio.
 *
 * Centraliza valores que antes estaban hardcodeados
 * en componentes individuales. Se provee en `app.config.ts`
 * con los datos reales del salón.
 *
 * @example
 * providers: [{
 *   provide: SITE_CONFIG,
 *   useValue: {
 *     name: 'Belleza & Estilo',
 *     description: 'Salón de belleza',
 *     url: 'https://bellezayestilo.com',
 *     phone: '(11) 5555-1234',
 *   },
 * }]
 */
export const SITE_CONFIG = new InjectionToken<SiteConfig>('SITE_CONFIG');
