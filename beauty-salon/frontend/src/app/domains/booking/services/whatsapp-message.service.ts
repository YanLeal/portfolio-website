import { Injectable, inject } from '@angular/core';
import { BusinessService } from '../../business/business.service';

export interface WaMessageParams {
  readonly name: string;
  readonly service: string;
  readonly date: string;
  readonly time: string;
  readonly notes?: string;
}

@Injectable({ providedIn: 'root' })
export class WhatsappMessageService {
  private readonly businessService = inject(BusinessService);

  private get siteName(): string {
    return this.businessService.data().site.name;
  }

  private get whatsapp(): string {
    return this.businessService.data().contact.whatsapp;
  }

  /** Construye el texto del mensaje a partir de los datos del turno */
  buildText(params: WaMessageParams): string {
    const lines: string[] = [
      '¡Hola! Quiero reservar un turno en ' + this.siteName + '.',
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
    return `https://wa.me/${this.whatsapp}?text=${encoded}`;
  }
}
