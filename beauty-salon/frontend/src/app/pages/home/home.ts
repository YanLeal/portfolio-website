import { Component } from '@angular/core';
import { HeroComponent } from '../../domains/content/hero/hero';
import { AboutComponent } from '../../features/about/about';
import { ServicesComponent } from '../../features/services/services';
import { PricingComponent } from '../../features/pricing/pricing';
import { GalleryComponent } from '../../features/gallery/gallery';
import { TeamComponent } from '../../features/team/team';
import { TestimonialsComponent } from '../../features/testimonials/testimonials';
import { ResultsComponent } from '../../features/results/results';
import { FaqComponent } from '../../features/faq/faq';
import { ContactComponent } from '../../features/contact/contact';
import { BookingCtaComponent } from '../../features/booking-cta/booking-cta';
import { ProcessComponent } from '../../features/process/process';
import { PromoComponent } from '../../features/promo/promo';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    AboutComponent,
    ServicesComponent,
    PricingComponent,
    GalleryComponent,
    TeamComponent,
    TestimonialsComponent,
    ResultsComponent,
    FaqComponent,
    ContactComponent,
    BookingCtaComponent,
    ProcessComponent,
    PromoComponent,
  ],
  templateUrl: './home.html',
})
export class HomePage {}
