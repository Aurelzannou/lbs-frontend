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
    <nb-layout>
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
      ::ng-deep .main-container {
        background: #fffcf0 !important;
      }
      ::ng-deep nb-menu {
        .menu-item {
          .menu-icon { color: #92400e; }
          .menu-title { color: #451a03; }
          &:hover {
            .menu-icon, .menu-title { color: #000000 !important; }
          }
          &.active {
            .menu-icon, .menu-title { color: #000000 !important; }
          }
        }
      }
    }

    nb-layout-header {
      border-bottom: 2px solid #fef3c7;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.05);
    }
  `],
})
export class OneColumnLayoutComponent {}
