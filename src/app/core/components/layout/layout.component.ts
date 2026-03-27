import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../services/auth.service';
import { LoadingService } from '../../services/loading.service';
import { KeycloakProfile } from 'keycloak-js';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatProgressBarModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
          [mode]="(isHandset$ | async) ? 'over' : 'side'"
          [opened]="(isHandset$ | async) === false">
        <mat-toolbar class="drawer-header">Menu</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/home" routerLinkActive="active-link">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Accueil</span>
          </a>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Tableau de bord</span>
          </a>
          <a mat-list-item routerLink="/niveaux" routerLinkActive="active-link">
            <mat-icon matListItemIcon>layers</mat-icon>
            <span matListItemTitle>Niveaux Scolaires</span>
          </a>
          <a mat-list-item routerLink="/etapes" routerLinkActive="active-link">
            <mat-icon matListItemIcon>route</mat-icon>
            <span matListItemTitle>Étapes du Workflow</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      
      <mat-sidenav-content>
        <mat-toolbar color="primary" class="main-toolbar">
          <button
            type="button"
            aria-label="Toggle sidenav"
            mat-icon-button
            (click)="drawer.toggle()"
            *ngIf="isHandset$ | async">
            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
          </button>
          
          <span class="brand">LBS Application</span>
          <span class="spacer"></span>
          
          <div class="user-actions">
            @if (authService.isLoggedIn) {
              <span class="username">{{ (userProfile$ | async)?.firstName }}</span>
              <button mat-icon-button (click)="authService.logout()" title="Déconnexion">
                <mat-icon>logout</mat-icon>
              </button>
            } @else {
              <button mat-flat-button color="accent" (click)="authService.login()">
                <mat-icon>login</mat-icon>
                Connexion
              </button>
            }
          </div>
          
          <mat-progress-bar 
            *ngIf="loadingService.isLoading()" 
            class="loading-bar" 
            mode="indeterminate" 
            color="accent">
          </mat-progress-bar>
        </mat-toolbar>
        
        <main class="content-wrapper">
          <ng-content></ng-content>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .sidenav-container {
      height: 100vh;
    }
    
    .sidenav {
      width: 250px;
      border-right: none;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 2px 0 8px rgba(0,0,0,0.05);
    }
    
    .drawer-header {
      font-weight: 600;
      color: var(--primary-color, #1976d2);
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    
    .main-toolbar {
      position: sticky;
      top: 0;
      z-index: 2;
      background: rgba(25, 118, 210, 0.9) !important;
      backdrop-filter: blur(8px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .loading-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    .brand {
      font-family: 'Outfit', sans-serif;
      font-weight: 700;
      letter-spacing: 0.5px;
    }
    
    .user-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .username {
      font-size: 0.9rem;
      font-weight: 500;
      opacity: 0.9;
    }
    
    .content-wrapper {
      padding: 24px;
      min-height: calc(100vh - 64px);
      background: #f8f9fa;
    }
    
    .active-link {
      background: rgba(25, 118, 210, 0.1) !important;
      color: #1976d2 !important;
      border-right: 4px solid #1976d2;
    }
  `
})
export class LayoutComponent implements OnInit {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  isHandset$: Observable<boolean> = of(false); 
  userProfile$: Observable<KeycloakProfile | null> = of(null);

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      this.userProfile$ = this.authService.getUserProfile();
    }
  }
}
