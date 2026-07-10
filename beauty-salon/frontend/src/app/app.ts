import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './layout/header/header';
import { FooterComponent } from './layout/footer/footer';
import { FloatingWhatsappComponent } from './shared/components/floating-whatsapp/floating-whatsapp';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FloatingWhatsappComponent],
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.parseUrl(this.router.url);
        if (url.fragment) {
          // Timeout para que el DOM termine de renderizar la nueva ruta
          setTimeout(() => {
            document.getElementById(url.fragment!)?.scrollIntoView({ behavior: 'smooth' });
          }, 50);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
  }
}
