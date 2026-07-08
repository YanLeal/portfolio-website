import { Injectable } from '@angular/core';

export interface BookingRequest {
  serviceId: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  submit(request: BookingRequest): Promise<boolean> {
    // TODO: connect to backend or email service
    return Promise.resolve(true);
  }
}
