import { InjectionToken } from '@angular/core';

/**
 * Número de WhatsApp del negocio en formato internacional
 * (código de país + número, sin signos).
 *
 * Se provee en `app.config.ts` para que los componentes
 * no dependan directamente de BusinessService.
 *
 * @example
 * providers: [{ provide: WHATSAPP_NUMBER, useValue: '5491123456789' }]
 */
export const WHATSAPP_NUMBER = new InjectionToken<string>(
  'WHATSAPP_NUMBER',
);
