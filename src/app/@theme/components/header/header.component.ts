import { Component, OnInit, OnDestroy, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule
  ],
  template: `
    <mat-toolbar class="app-header">
      <div class="header-left">
        <button mat-icon-button (click)="onToggleSidebar()" class="menu-toggle">
          <mat-icon>menu</mat-icon>
        </button>
        <a class="logo-text" routerLink="/dashboard">
          LBS-<span class="logo-bold">Admin</span>
        </a>
      </div>

      <div class="header-right">
        @if (authenticated) {
          <div class="user-info" [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">{{ userInitial }}</div>
            <span class="user-name">{{ userName }}</span>
            <mat-icon class="dropdown-icon">expand_more</mat-icon>
          </div>
          <mat-menu #userMenu="matMenu" class="user-menu-panel">
            <button mat-menu-item routerLink="/profile">
              <mat-icon>person</mat-icon>
              <span>Mon Profil</span>
            </button>
            <button mat-menu-item (click)="logout()" class="logout-item">
              <mat-icon>logout</mat-icon>
              <span>Déconnexion</span>
            </button>
          </mat-menu>
        } @else {
          <button mat-flat-button color="primary" routerLink="/login" class="login-btn">
            <mat-icon>login</mat-icon>
            Connexion
          </button>
        }
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .app-header {
      background: white;
      border-bottom: 2px solid #fef3c7;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
      height: 64px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .menu-toggle {
      color: #64748b;
      &:hover { color: #0f172a; }
    }

    .logo-text {
      font-family: 'Outfit', sans-serif;
      font-size: 1.4rem;
      color: #0f172a;
      text-decoration: none;
      padding-left: 0.75rem;
      border-left: 1px solid #e2e8f0;

      .logo-bold {
        font-weight: 900;
        color: #d97706;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      padding: 0.5rem 0.75rem;
      border-radius: 12px;
      transition: background 0.2s;

      &:hover { background: #f8fafc; }
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
      color: white;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }

    .user-name {
      font-weight: 600;
      color: #334155;
      font-size: 0.9rem;
    }

    .dropdown-icon {
      color: #94a3b8;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .login-btn {
      border-radius: 10px;
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  private keycloakService = inject(KeycloakService);
  private authService = inject(AuthService);
  private router = inject(Router);

  authenticated = false;
  userName = '';
  userInitial = '';

  async ngOnInit() {
    this.authenticated = await this.keycloakService.isLoggedIn();
    if (this.authenticated) {
      const profile = await this.keycloakService.loadUserProfile();
      this.userName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Utilisateur';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.authService.logout();
  }
}
