import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { TuteurAuthService } from '../../../core/services/tuteur-auth.service';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div class="portal-wrapper">
      <!-- Header avec profil et déconnexion -->
      <header class="portal-header">
        <div class="user-welcome">
          <div class="avatar-circle">{{ userInitial }}</div>
          <div>
            <h1>Bonjour, {{ userName }}</h1>
            <p>Heureux de vous revoir sur votre espace parent.</p>
          </div>
        </div>
        <button mat-flat-button class="logout-btn" (click)="logout()">
          <mat-icon>logout</mat-icon>
          Déconnexion
        </button>
      </header>

      <!-- Section Actions Rapides -->
      <div class="quick-actions">
        <mat-card class="action-card primary-action" routerLink="/portail/inscription">
          <div class="card-content">
            <div class="icon-bg">
              <mat-icon>person_add</mat-icon>
            </div>
            <div class="text-content">
              <h2>Inscrire un enfant</h2>
              <p>Commencez une nouvelle inscription pour l'année en cours.</p>
            </div>
            <mat-icon class="arrow">chevron_right</mat-icon>
          </div>
        </mat-card>
      </div>

      <!-- Grid d'informations -->
      <div class="info-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <div mat-card-avatar class="icon-avatar blue">
              <mat-icon>child_care</mat-icon>
            </div>
            <mat-card-title>Mes Enfants</mat-card-title>
            <mat-card-subtitle>Suivi des scolarités</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="empty-state">
              <p>Aucun enfant inscrit pour le moment.</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="info-card">
          <mat-card-header>
            <div mat-card-avatar class="icon-avatar amber">
              <mat-icon>payments</mat-icon>
            </div>
            <mat-card-title>Paiements</mat-card-title>
            <mat-card-subtitle>Historique des transactions</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="empty-state">
              <p>Aucun paiement récent.</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .portal-wrapper {
      padding: 2rem;
      max-width: 1100px;
      margin: 0 auto;
      animation: fadeIn 0.8s ease-out;
    }

    .portal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;

      .user-welcome {
        display: flex;
        align-items: center;
        gap: 1.5rem;

        .avatar-circle {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          box-shadow: 0 10px 20px rgba(30, 58, 138, 0.2);
        }

        h1 { font-size: 2rem; font-weight: 800; color: #0f172a; margin: 0; }
        p { color: #64748b; margin: 0; font-size: 1.1rem; }
      }

      .logout-btn {
        background: #f1f5f9;
        color: #475569;
        border-radius: 12px;
        height: 48px;
        font-weight: 600;
        &:hover { background: #e2e8f0; color: #ef4444; }
      }
    }

    .quick-actions {
      margin-bottom: 3rem;
      .action-card {
        cursor: pointer;
        border-radius: 2rem;
        border: none;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        padding: 2rem;
        
        &.primary-action {
          background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
          color: white;
          box-shadow: 0 20px 40px rgba(30, 58, 138, 0.3);
          
          &:hover {
            transform: translateY(-8px);
            box-shadow: 0 30px 60px rgba(30, 58, 138, 0.4);
            .arrow { transform: translateX(10px); }
          }
        }

        .card-content {
          display: flex;
          align-items: center;
          gap: 2rem;

          .icon-bg {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            mat-icon { font-size: 40px; width: 40px; height: 40px; }
          }

          .text-content {
            flex-grow: 1;
            h2 { font-size: 1.75rem; font-weight: 800; margin: 0 0 0.5rem; }
            p { font-size: 1.1rem; opacity: 0.8; margin: 0; }
          }

          .arrow { font-size: 32px; width: 32px; height: 32px; transition: transform 0.3s; }
        }
      }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;

      .info-card {
        border-radius: 1.5rem;
        border: 1px solid #f1f5f9;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        
        .icon-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          &.blue { background: #dbeafe; color: #2563eb; }
          &.amber { background: #fef3c7; color: #d97706; }
        }

        mat-card-title { font-weight: 700; color: #0f172a; }

        .empty-state {
          padding: 3rem 0;
          text-align: center;
          color: #94a3b8;
          font-style: italic;
        }
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .portal-header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
      .quick-actions .card-content { flex-direction: column; text-align: center; }
    }
  `]
})
export class PortalDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private tuteurAuthService = inject(TuteurAuthService);
  private keycloakService = inject(KeycloakService);

  userName: string = 'Parent';
  userInitial: string = 'P';

  async ngOnInit() {
    if (await this.keycloakService.isLoggedIn()) {
      const profile = await this.keycloakService.loadUserProfile();
      this.userName = profile.firstName || 'Parent';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
  }

  logout() {
    this.tuteurAuthService.logout();
  }
}
