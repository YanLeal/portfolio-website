import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header';
import { FooterComponent } from './layout/footer/footer';
import { FloatingWhatsappComponent } from './shared/components/floating-whatsapp/floating-whatsapp';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FloatingWhatsappComponent],
  templateUrl: './app.html',
})
export class App {}
