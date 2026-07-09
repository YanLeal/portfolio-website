import { Injectable } from '@angular/core';

export interface WaMessageParams {
  name: string;
  service: string;
  date: string;
  time: string;
  notes?: string;
}

const PHONE = '5214423018772';

@Injectable({ providedIn: 'root' })
export class WhatsappMessageService {
  /** Construye el texto del mensaje a partir de los datos del turno */
  buildText(params: WaMessageParams): string {
    const lines: string[] = [
      '¡Hola! Quiero reservar un turno en Belleza & Estilo.',
      '',
      `Nombre: ${params.name}`,
      `Servicio: ${params.service}`,
    ];

    if (params.date) {
      lines.push(`Fecha: ${params.date}`);
    }

    if (params.time) {
      lines.push(`Horario: ${params.time} hs`);
    }

    if (params.notes?.trim()) {
      lines.push('');
      lines.push(`Notas: ${params.notes.trim()}`);
    }

    lines.push('');
    lines.push('Gracias!');

    return lines.join('\n');
  }

  /** Genera la URL completa de WhatsApp con el mensaje prearmado */
  buildUrl(params: WaMessageParams): string {
    const text = this.buildText(params);
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${PHONE}?text=${encoded}`;
  }
}
