import type { Badge } from '../../shared/types/badge.types';

export type ServiceIcon =
  | 'scissors'
  | 'sparkles'
  | 'hand'
  | 'foot'
  | 'brush'
  | 'face';

export type ServiceCategory =
  | 'cabello'
  | 'uñas'
  | 'maquillaje'
  | 'tratamientos';

/** Identificadores semánticos de badges para el dominio Services.
 *  Refinamiento del tipo abierto `string` de Badge. */
export type ServiceBadgeId =
  | 'new'
  | 'popular'
  | 'best-seller'
  | 'featured'
  | 'limited';

/** Badge visual asociado a un servicio, con ID tipado para este dominio.
 *  La interfaz base es compartida (Badge), lo que permite que el
 *  componente <app-badge> funcione con cualquier dominio. */
export type ServiceBadge = Badge & { readonly id: ServiceBadgeId };
