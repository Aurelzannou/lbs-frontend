import { Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';

export interface MenuItem {
  title: string;
  icon?: string;
  link?: string;
  children?: MenuItem[];
  expanded?: boolean;
}

@Component({
  selector: 'app-one-column-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatExpansionModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    HeaderComponent,
    FooterComponent
  ],
  template: `
    <div class="app-layout">
      <mat-sidenav-container class="sidenav-container">
        <!-- Sidebar -->
        <mat-sidenav #sidenav mode="side" [opened]="true" class="app-sidebar">
          <div class="sidebar-header">
            <div class="brand-logo">LBS</div>
            <span class="brand-name">Education</span>
          </div>

          <mat-nav-list class="sidebar-nav">
            @for (item of menu; track item.title) {
              @if (item.children && item.children.length > 0) {
                <!-- Parent with children -->
                <mat-expansion-panel class="menu-group" [expanded]="item.expanded ?? false" hideToggle>
                  <mat-expansion-panel-header>
                    <mat-panel-title>
                      @if (item.icon) {
                        <mat-icon class="menu-icon">{{ getMaterialIcon(item.icon) }}</mat-icon>
                      }
                      <span class="menu-label">{{ item.title }}</span>
                    </mat-panel-title>
                  </mat-expansion-panel-header>
                  @for (child of item.children; track child.title) {
                    <a mat-list-item [routerLink]="child.link" routerLinkActive="active-link" class="sub-item">
                      @if (child.icon) {
                        <mat-icon class="sub-icon">{{ getMaterialIcon(child.icon) }}</mat-icon>
                      }
                      <span class="sub-label">{{ child.title }}</span>
                    </a>
                  }
                </mat-expansion-panel>
              } @else {
                <!-- Simple link -->
                <a mat-list-item [routerLink]="item.link" routerLinkActive="active-link" class="menu-item">
                  @if (item.icon) {
                    <mat-icon class="menu-icon">{{ getMaterialIcon(item.icon) }}</mat-icon>
                  }
                  <span class="menu-label">{{ item.title }}</span>
                </a>
              }
            }
          </mat-nav-list>
        </mat-sidenav>

        <!-- Main content -->
        <mat-sidenav-content class="main-content">
          <app-header (toggleSidebar)="sidenav.toggle()"></app-header>
          <main class="content-area">
            <ng-content></ng-content>
          </main>
          <app-footer></app-footer>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .sidenav-container {
      flex: 1;
    }

    .app-sidebar {
      width: 260px;
      background: #0f172a;
      border-right: none;
      box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);

      .brand-logo {
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: #451a03;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 0.85rem;
        letter-spacing: 1px;
      }

      .brand-name {
        font-family: 'Outfit', sans-serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: white;
      }
    }

    .sidebar-nav {
      padding: 0.5rem 0;
    }

    /* Simple menu items */
    .menu-item {
      margin: 2px 8px;
      border-radius: 10px !important;
      color: #94a3b8 !important;
      height: 44px !important;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.05) !important;
        color: white !important;
      }

      &.active-link {
        background: rgba(251, 191, 36, 0.1) !important;
        color: #fbbf24 !important;
        
        .menu-icon { color: #fbbf24; }
      }
    }

    .menu-icon {
      color: #64748b;
      margin-right: 12px;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .menu-label {
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Expansion panel (parent with children) */
    ::ng-deep .menu-group {
      background: transparent !important;
      box-shadow: none !important;
      margin: 2px 8px;
      border-radius: 10px !important;

      .mat-expansion-panel-header {
        padding: 0 16px;
        height: 44px;
        color: #94a3b8;
        border-radius: 10px !important;

        &:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }

        .mat-panel-title {
          color: #94a3b8;
          display: flex;
          align-items: center;
          font-size: 0.875rem;
          font-weight: 500;
        }
      }

      .mat-expansion-panel-body {
        padding: 0 0 4px 0;
      }
    }

    .sub-item {
      height: 38px !important;
      margin: 1px 4px 1px 20px;
      border-radius: 8px !important;
      color: #64748b !important;
      font-size: 0.825rem;

      &:hover {
        background: rgba(255, 255, 255, 0.04) !important;
        color: #cbd5e1 !important;
      }

      &.active-link {
        background: rgba(251, 191, 36, 0.08) !important;
        color: #fbbf24 !important;
        
        .sub-icon { color: #fbbf24; }
      }
    }

    .sub-icon {
      color: #475569;
      margin-right: 10px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .sub-label {
      font-size: 0.825rem;
      font-weight: 500;
    }

    /* Main content area */
    .main-content {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f1f5f9;
    }

    .content-area {
      flex: 1;
      padding: 1.5rem;
    }
  `]
})
export class OneColumnLayoutComponent {
  @Input() menu: MenuItem[] = [];

  /** Maps Eva icon names to Material icon names */
  getMaterialIcon(evaName: string): string {
    const iconMap: Record<string, string> = {
      'home-outline': 'dashboard',
      'person-outline': 'person',
      'people-outline': 'group',
      'shield-outline': 'admin_panel_settings',
      'lock-outline': 'lock',
      'menu-outline': 'menu',
      'settings-2-outline': 'settings',
      'layers-outline': 'layers',
      'calendar-outline': 'calendar_today',
      'book-open-outline': 'menu_book',
      'cube-outline': 'widgets',
      'list-outline': 'list',
    };
    return iconMap[evaName] || evaName;
  }
}
