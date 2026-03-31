import { Component } from '@angular/core';
import { NbLayoutModule, NbSidebarModule } from '@nebular/theme';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-one-column-layout',
  standalone: true,
  imports: [
    NbLayoutModule,
    NbSidebarModule,
    HeaderComponent,
    FooterComponent,
  ],
  template: `
    <nb-layout windowMode>
      <nb-layout-header fixed>
        <app-header></app-header>
      </nb-layout-header>

      <nb-sidebar class="menu-sidebar" tag="menu-sidebar" responsive>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <app-footer></app-footer>
      </nb-layout-footer>
    </nb-layout>
  `,
  styles: [`
    :host {
      display: block;
    }
    
    .menu-sidebar {
      z-index: 1000;
    }
  `],
})
export class OneColumnLayoutComponent {}
