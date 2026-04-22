import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuteurAuthService } from '../../../core/services/tuteur-auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Bienvenue, {{ (tuteur$ | async)?.prenom }} {{ (tuteur$ | async)?.nom }}</h1>
        <button mat-icon-button (click)="logout()" title="Déconnexion">
          <mat-icon>logout</mat-icon>
        </button>
      </header>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>child_care</mat-icon>
            <mat-card-title>Mes Enfants</mat-card-title>
            <mat-card-subtitle>0 élèves inscrits</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/portail/inscription">NOUVELLE INSCRIPTION</button>
          </mat-card-actions>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>account_balance_wallet</mat-icon>
            <mat-card-title>Paiements</mat-card-title>
            <mat-card-subtitle>Historique et règlements</mat-card-subtitle>
          </mat-card-header>
          <mat-card-actions>
            <button mat-button color="primary">VOIR TOUT</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      h1 { color: #1a237e; margin: 0; }
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
    .stat-card {
      border-radius: 12px;
      transition: transform 0.3s ease;
      &:hover {
        transform: translateY(-5px);
      }
    }
  `]
})
export class PortalDashboardComponent {
  private authService = inject(TuteurAuthService);
  tuteur$ = this.authService.tuteur$;

  logout() {
    this.authService.logout();
  }
}
