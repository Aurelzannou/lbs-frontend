import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { TuteurAuthService } from '../../../core/services/tuteur-auth.service';
import { DossierEleveService } from '../../../core/services/dossier-eleve.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule,
            RouterModule, MatProgressSpinnerModule],
  template: `
    <div class="portal-wrapper">

      <!-- Header -->
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

      <!-- Action rapide -->
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

      <!-- Mes dossiers d'inscription -->
      <div class="section">
        <h2 class="section-title">
          <mat-icon>folder_open</mat-icon>
          Mes dossiers d'inscription
        </h2>

        <div *ngIf="loadingDossiers" class="loading-center">
          <mat-spinner diameter="32"></mat-spinner>
        </div>

        <div *ngIf="!loadingDossiers && dossiers.length === 0" class="empty-state">
          <mat-icon>inbox</mat-icon>
          <p>Aucun dossier soumis pour le moment.</p>
          <button mat-stroked-button routerLink="/portail/inscription">
            Faire une inscription
          </button>
        </div>

        <div class="dossiers-grid" *ngIf="!loadingDossiers && dossiers.length > 0">
          <div class="dossier-card" *ngFor="let d of dossiers">
            <div class="dossier-avatar">
              {{ (d.elevePrenom || d.eleve?.prenom || '?')[0] }}{{ (d.eleveNom || d.eleve?.nom || '?')[0] }}
            </div>
            <div class="dossier-info">
              <span class="dossier-name">
                {{ d.elevePrenom || d.eleve?.prenom }} {{ d.eleveNom || d.eleve?.nom }}
              </span>
              <span class="dossier-classe">
                {{ d.classeLibelle || d.classe?.code || '—' }} · {{ d.anneeScolaireLibelle || d.anneeScolaire?.code || '—' }}
              </span>
              <span class="dossier-numero" *ngIf="d.numero">N° {{ d.numero }}</span>
            </div>
            <span class="statut-badge" [ngClass]="getStatutClass(d.statutLibelle || d.statut?.code)">
              {{ d.statutLibelle || d.statut?.libelle || '—' }}
            </span>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .portal-wrapper {
      padding: 2rem;
      max-width: 1100px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease-out;
    }

    .portal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;

      .user-welcome {
        display: flex;
        align-items: center;
        gap: 1.25rem;

        .avatar-circle {
          width: 56px; height: 56px;
          background: linear-gradient(135deg, #1e3a8a, #3b82f6);
          color: white; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.3rem; font-weight: 800;
        }
        h1 { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0; }
        p  { color: #64748b; margin: 0; }
      }

      .logout-btn {
        background: #f1f5f9; color: #475569; border-radius: 10px;
        font-weight: 600;
        &:hover { background: #e2e8f0; color: #ef4444; }
      }
    }

    .quick-actions {
      margin-bottom: 2.5rem;
      .action-card {
        cursor: pointer; border-radius: 1.5rem; border: none;
        transition: all 0.3s ease; padding: 1.5rem;
        background: linear-gradient(135deg, #1e3a8a, #2563eb);
        color: white;
        box-shadow: 0 10px 30px rgba(30,58,138,0.25);
        &:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(30,58,138,0.35); }

        .card-content {
          display: flex; align-items: center; gap: 1.5rem;
          .icon-bg {
            width: 60px; height: 60px;
            background: rgba(255,255,255,0.15); border-radius: 1rem;
            display: flex; align-items: center; justify-content: center;
            mat-icon { font-size: 30px; width: 30px; height: 30px; }
          }
          .text-content { flex: 1;
            h2 { font-size: 1.4rem; font-weight: 800; margin: 0 0 0.25rem; }
            p  { font-size: 0.95rem; opacity: 0.8; margin: 0; }
          }
          .arrow { font-size: 28px; width: 28px; height: 28px; }
        }
      }
    }

    .section {
      .section-title {
        display: flex; align-items: center; gap: 0.5rem;
        font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem;
        mat-icon { color: #2563eb; }
      }
    }

    .loading-center {
      display: flex; justify-content: center; padding: 2rem;
    }

    .empty-state {
      text-align: center; padding: 2.5rem;
      background: white; border-radius: 12px; border: 1px dashed #e2e8f0;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #cbd5e1; }
      p { color: #94a3b8; margin: 0.75rem 0 1.25rem; }
    }

    .dossiers-grid {
      display: flex; flex-direction: column; gap: 0.75rem;
    }

    .dossier-card {
      display: flex; align-items: center; gap: 1rem;
      background: white; border-radius: 12px;
      border: 1px solid #f1f5f9; padding: 1rem 1.25rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.04);
      transition: box-shadow 0.2s;
      &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    }

    .dossier-avatar {
      width: 42px; height: 42px; border-radius: 50%;
      background: #1e293b; color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.75rem; font-weight: 700; flex-shrink: 0; text-transform: uppercase;
    }

    .dossier-info {
      flex: 1; display: flex; flex-direction: column; gap: 0.15rem;
      .dossier-name   { font-weight: 700; font-size: 0.95rem; color: #1e293b; }
      .dossier-classe { font-size: 0.8rem; color: #64748b; }
      .dossier-numero { font-size: 0.75rem; color: #94a3b8; font-family: monospace; }
    }

    .statut-badge {
      padding: 0.25rem 0.75rem; border-radius: 20px;
      font-size: 0.72rem; font-weight: 700; white-space: nowrap;
      &.st-depose  { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
      &.st-attente { background: #dbeafe; color: #1d4ed8; border: 1px solid #bfdbfe; }
      &.st-accepte { background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
      &.st-refuse  { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
      &.st-inscrit { background: #d1fae5; color: #064e3b; border: 1px solid #6ee7b7; font-weight: 800; }
      &.st-default { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 640px) {
      .portal-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
    }
  `]
})
export class PortalDashboardComponent implements OnInit {
  private authService      = inject(AuthService);
  private tuteurAuthService = inject(TuteurAuthService);
  private keycloakService  = inject(KeycloakService);
  private dossierService   = inject(DossierEleveService);

  userName    = 'Parent';
  userInitial = 'P';
  dossiers: any[] = [];
  loadingDossiers = false;

  async ngOnInit() {
    if (await this.keycloakService.isLoggedIn()) {
      const profile = await this.keycloakService.loadUserProfile();
      this.userName    = profile.firstName || 'Parent';
      this.userInitial = this.userName.charAt(0).toUpperCase();
    }
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.loadingDossiers = true;
    this.dossierService.getMesDossiers().subscribe({
      next: (data: any) => {
        this.dossiers = Array.isArray(data) ? data : (data?.data || []);
        this.loadingDossiers = false;
      },
      error: () => { this.loadingDossiers = false; }
    });
  }

  getStatutClass(code: string): string {
    const map: Record<string, string> = {
      DEPOSE: 'st-depose', EN_ATTENTE: 'st-attente',
      ACCEPTE: 'st-accepte', REFUSE: 'st-refuse', INSCRIT: 'st-inscrit'
    };
    return map[code] || 'st-default';
  }

  logout() { this.tuteurAuthService.logout(); }
}
