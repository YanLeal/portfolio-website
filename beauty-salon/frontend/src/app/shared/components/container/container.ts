import { Component, input } from '@angular/core';

@Component({
  selector: 'app-container',
  standalone: true,
  template: `
    <div
      class="mx-auto w-full px-4 md:px-6 lg:px-8"
      [class.max-w-content]="!narrow()"
      [class.max-w-[800px]]="narrow()"
    >
      <ng-content />
    </div>
  `,
})
export class ContainerComponent {
  readonly narrow = input(false);
}
