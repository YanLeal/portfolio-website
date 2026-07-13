import { Injectable, inject } from '@angular/core';
import { ConfigService } from './config.service';

export interface WaMessageParams {
  readonly name: string;
  readonly service: string;
  readonly date: string;
  readonly time: string;
  readonly notes?: string;
}

@Injectable({ providedIn: 'root' })
export class WhatsappMessageService {
  private readonly configService = inject(ConfigService);

  private get siteName(): string {
    return this.configService.config()?.site.name ?? 'Belleza & Estilo';
  }

  private get whatsapp(): string {
    return this.configService.config()?.contact.whatsapp ?? '5214423016543';
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
