export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'rescheduled';

export interface BookingRequest {
  /** ID del servicio seleccionado */
  serviceId: string;

  /** Nombre de la persona */
  name: string;

  /** WhatsApp / teléfono de contacto */
  phone: string;

  /** Fecha seleccionada (opcional) — formato ISO (yyyy-mm-dd) */
  date?: string;

  /** Horario seleccionado (opcional) — formato HH:mm */
  time?: string;

  /** Comentarios adicionales */
  notes?: string;

  /** Cómo se creó el turno */
  source?: 'website-form' | 'whatsapp';

  /** Metadatos adicionales para el backend */
  metadata?: Record<string, string>;
}

export interface BookingResponse {
  /** ID del turno asignado por el backend */
  id: string;

  /** Estado actual del turno */
  status: BookingStatus;

  /** Mensaje legible para mostrar al usuario */
  message: string;

  /** Timestamp ISO de creación */
  createdAt: string;
}

/** Vista resumida para mostrar en el frontend después de crear el turno */
export interface BookingConfirmation {
  id: string;
  status: BookingStatus;
  message: string;
}
