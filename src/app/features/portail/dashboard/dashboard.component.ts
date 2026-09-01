import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { TuteurAuthService } from '../../../core/services/tuteur-auth.service';
import { ValidationService } from '../../../core/services/validation.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PortalEmploiDuTempsDialogComponent } from '../emploi-du-temps-dialog/emploi-du-temps-dialog.component';
import { PresenceHistoriqueDialogComponent } from '../presence-historique-dialog/presence-historique-dialog.component';
import { PresenceService } from '../../../core/services/presence.service';
import { PresenceEnfant } from '../../../core/models/presence.model';

@Component({
  selector: 'app-portal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule
  ],
  template: `
    <div class="portal-wrapper">
      <!-- Banner succès inscription -->
      <div class="success-banner" *ngIf="inscriptionSuccess">
        <mat-icon>check_circle</mat-icon>
        <div>
          <strong *ngIf="paiementConfirme">
            Paiement reçu{{ montantPaye ? ' (' + (montantPaye | number: '1.0-0') + ' FCFA)' : '' }} —
            inscription enregistrée !
          </strong>
          <strong *ngIf="!paiementConfirme">Inscription soumise avec succès !</strong>
          <span>L'administration examinera votre dossier et vous serez notifié par e-mail.</span>
        </div>
        <button class="banner-close" (click)="inscriptionSuccess = false">
          <mat-icon>close</mat-icon>
        </button>
      </div>

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
            <div class="icon-bg"><mat-icon>person_add</mat-icon></div>
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
        <div class="section-header">
          <h2 class="section-title">
            <mat-icon>folder_open</mat-icon>
            Mes dossiers d'inscription
          </h2>
          <span class="dossier-count" *ngIf="dossiers.length > 0"
            >{{ dossiersFiltres.length }} / {{ dossiers.length }} dossier(s)</span
          >
        </div>

        <!-- Barre de recherche -->
        <div class="search-bar" *ngIf="dossiers.length > 0">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            class="search-input"
            type="text"
            placeholder="Rechercher par nom, classe, année, statut…"
            [(ngModel)]="recherche"
            (ngModelChange)="filtrer()"
          />
          <button class="search-clear" *ngIf="recherche" (click)="recherche = ''; filtrer()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

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

        <div
          *ngIf="!loadingDossiers && dossiers.length > 0 && dossiersFiltres.length === 0"
          class="empty-state"
        >
          <mat-icon>search_off</mat-icon>
          <p>Aucun résultat pour « {{ recherche }} »</p>
        </div>

        <!-- Tableau (desktop) -->
        <div class="table-wrapper" *ngIf="!loadingDossiers && dossiersFiltres.length > 0">
          <table class="dossiers-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>Classe</th>
                <th>Année scolaire</th>
                <th>N° Dossier</th>
                <th>Date dépôt</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of dossiersFiltres" [class.row-new]="d.id === newDossierId">
                <td>
                  <div class="cell-eleve">
                    <div class="avatar-sm">
                      {{ (d.elevePrenom || '?')[0] }}{{ (d.eleveNom || '?')[0] }}
                    </div>
                    <div>
                      <span class="eleve-name">{{ d.elevePrenom }} {{ d.eleveNom }}</span>
                      <span class="new-badge" *ngIf="d.id === newDossierId">Nouveau</span>
                    </div>
                  </div>
                </td>
                <td>{{ d.classeLibelle || '—' }}</td>
                <td>{{ d.anneeScolaireLibelle || '—' }}</td>
                <td class="mono">{{ d.numero || '—' }}</td>
                <td>{{ d.dateDebut ? (d.dateDebut | date: 'dd/MM/yyyy') : '—' }}</td>
                <td>
                  <span class="statut-badge" [ngClass]="getStatutClass(d.statutLibelle)">
                    {{ d.statutLibelle || 'Déposé' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button
                      class="edt-btn"
                      *ngIf="canVoirEmploiDuTemps(d)"
                      (click)="voirEmploiDuTemps(d)"
                    >
                      <mat-icon>calendar_month</mat-icon>
                      Emploi du temps
                    </button>
                    <button
                      class="edt-btn presence-btn"
                      *ngIf="canVoirPresences(d)"
                      (click)="voirPresences(d)"
                    >
                      <mat-icon>fact_check</mat-icon>
                      Présences
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Cartes (mobile) -->
        <div class="cards-mobile" *ngIf="!loadingDossiers && dossiersFiltres.length > 0">
          <div
            class="mobile-card"
            *ngFor="let d of dossiersFiltres"
            [class.new]="d.id === newDossierId"
          >
            <div class="mc-header">
              <div class="cell-eleve">
                <div class="avatar-sm">
                  {{ (d.elevePrenom || '?')[0] }}{{ (d.eleveNom || '?')[0] }}
                </div>
                <div>
                  <span class="eleve-name">{{ d.elevePrenom }} {{ d.eleveNom }}</span>
                  <span class="new-badge" *ngIf="d.id === newDossierId">Nouveau</span>
                </div>
              </div>
              <span class="statut-badge" [ngClass]="getStatutClass(d.statutLibelle)">
                {{ d.statutLibelle || 'Déposé' }}
              </span>
            </div>
            <div class="mc-body">
              <div class="mc-row">
                <span class="mc-label">Classe</span><span>{{ d.classeLibelle || '—' }}</span>
              </div>
              <div class="mc-row">
                <span class="mc-label">Année</span><span>{{ d.anneeScolaireLibelle || '—' }}</span>
              </div>
              <div class="mc-row">
                <span class="mc-label">N° Dossier</span
                ><span class="mono">{{ d.numero || '—' }}</span>
              </div>
              <div class="mc-row">
                <span class="mc-label">Date dépôt</span
                ><span>{{ d.dateDebut ? (d.dateDebut | date: 'dd/MM/yyyy') : '—' }}</span>
              </div>
              <button
                class="edt-btn edt-btn-block"
                *ngIf="canVoirEmploiDuTemps(d)"
                (click)="voirEmploiDuTemps(d)"
              >
                <mat-icon>calendar_month</mat-icon>
                Emploi du temps
              </button>
              <button
                class="edt-btn presence-btn edt-btn-block"
                *ngIf="canVoirPresences(d)"
                (click)="voirPresences(d)"
              >
                <mat-icon>fact_check</mat-icon>
                Présences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .portal-wrapper {
        padding: 2rem;
        max-width: 1100px;
        margin: 0 auto;
        animation: fadeIn 0.5s ease-out;
        font-family: 'Inter', sans-serif;
      }

      // ── Banner succès ─────────────────────────────────────────────────────────
      .success-banner {
        display: flex;
        align-items: center;
        gap: 0.875rem;
        background: #d1fae5;
        border: 1px solid #a7f3d0;
        border-radius: 12px;
        padding: 1rem 1.25rem;
        margin-bottom: 1.5rem;
        animation: slideDown 0.4s ease-out;

        mat-icon {
          color: #059669;
          font-size: 1.4rem;
          width: 1.4rem;
          height: 1.4rem;
          flex-shrink: 0;
        }

        div {
          flex: 1;
          strong {
            display: block;
            color: #065f46;
            font-size: 0.95rem;
          }
          span {
            color: #047857;
            font-size: 0.82rem;
          }
        }

        .banner-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #059669;
          display: flex;
          align-items: center;
          padding: 0.25rem;
          border-radius: 6px;
          transition: background 0.18s;
          &:hover {
            background: #a7f3d0;
          }
          mat-icon {
            font-size: 1.1rem;
            width: 1.1rem;
            height: 1.1rem;
          }
        }
      }

      // ── Header ────────────────────────────────────────────────────────────────
      .portal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;

        .user-welcome {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          .avatar-circle {
            width: 52px;
            height: 52px;
            background: linear-gradient(135deg, #1e3a8a, #3b82f6);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: 800;
          }
          h1 {
            font-size: 1.6rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
          }
          p {
            color: #64748b;
            margin: 0;
            font-size: 0.875rem;
          }
        }

        .logout-btn {
          background: #f1f5f9;
          color: #475569;
          border-radius: 10px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          &:hover {
            background: #e2e8f0;
            color: #ef4444;
          }
        }
      }

      // ── Action rapide ─────────────────────────────────────────────────────────
      .quick-actions {
        margin-bottom: 2rem;
        .action-card {
          cursor: pointer;
          border-radius: 1.5rem;
          border: none;
          transition: all 0.3s ease;
          padding: 1.5rem;
          background: linear-gradient(135deg, #1e3a8a, #2563eb);
          color: white;
          box-shadow: 0 10px 30px rgba(30, 58, 138, 0.25);
          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(30, 58, 138, 0.35);
          }

          .card-content {
            display: flex;
            align-items: center;
            gap: 1.5rem;
            .icon-bg {
              width: 56px;
              height: 56px;
              background: rgba(255, 255, 255, 0.15);
              border-radius: 1rem;
              display: flex;
              align-items: center;
              justify-content: center;
              mat-icon {
                font-size: 28px;
                width: 28px;
                height: 28px;
              }
            }
            .text-content {
              flex: 1;
              h2 {
                font-size: 1.3rem;
                font-weight: 800;
                margin: 0 0 0.2rem;
              }
              p {
                font-size: 0.9rem;
                opacity: 0.8;
                margin: 0;
              }
            }
            .arrow {
              font-size: 26px;
              width: 26px;
              height: 26px;
            }
          }
        }
      }

      // ── Section dossiers ──────────────────────────────────────────────────────
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1rem;
      }

      .section-title {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 1rem;
        font-weight: 700;
        color: #1e293b;
        margin: 0;
        mat-icon {
          color: #2563eb;
          font-size: 1.2rem;
          width: 1.2rem;
          height: 1.2rem;
        }
      }

      .dossier-count {
        font-size: 0.78rem;
        font-weight: 700;
        color: #2563eb;
        background: #dbeafe;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
      }

      .loading-center {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }

      .empty-state {
        text-align: center;
        padding: 2.5rem;
        background: white;
        border-radius: 12px;
        border: 1px dashed #e2e8f0;
        mat-icon {
          font-size: 40px;
          width: 40px;
          height: 40px;
          color: #cbd5e1;
        }
        p {
          color: #94a3b8;
          margin: 0.75rem 0 1.25rem;
        }
      }

      // ── Barre de recherche ────────────────────────────────────────────────────
      .search-bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.5rem 1rem;
        margin-bottom: 1rem;
        transition: border-color 0.2s;
        &:focus-within {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
        }

        .search-icon {
          color: #94a3b8;
          font-size: 1.1rem;
          width: 1.1rem;
          height: 1.1rem;
          flex-shrink: 0;
        }

        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
          color: #1e293b;
          background: transparent;
          &::placeholder {
            color: #94a3b8;
          }
        }

        .search-clear {
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex;
          align-items: center;
          padding: 0;
          border-radius: 4px;
          &:hover {
            color: #64748b;
          }
          mat-icon {
            font-size: 1rem;
            width: 1rem;
            height: 1rem;
          }
        }
      }

      // ── Tableau ───────────────────────────────────────────────────────────────
      .table-wrapper {
        background: white;
        border-radius: 12px;
        border: 1px solid #f1f5f9;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
      }

      .dossiers-table {
        width: 100%;
        border-collapse: collapse;

        thead tr {
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          th {
            padding: 0.75rem 1rem;
            text-align: left;
            font-size: 0.72rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            white-space: nowrap;
          }
        }

        tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background 0.15s;
          &:last-child {
            border-bottom: none;
          }
          &:hover {
            background: #f8fafc;
          }
          &.row-new {
            background: #f0fdf4;
            &:hover {
              background: #dcfce7;
            }
          }
          td {
            padding: 0.875rem 1rem;
            font-size: 0.85rem;
            color: #334155;
            vertical-align: middle;
          }
        }
      }

      .cell-eleve {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        .eleve-name {
          font-weight: 700;
          color: #1e293b;
          display: block;
        }
      }

      .avatar-sm {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #1e293b;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.65rem;
        font-weight: 700;
        flex-shrink: 0;
        text-transform: uppercase;
      }

      .mono {
        font-family: monospace;
        font-size: 0.78rem;
        color: #64748b;
      }

      .statut-badge {
        padding: 0.2rem 0.65rem;
        border-radius: 20px;
        font-size: 0.7rem;
        font-weight: 700;
        &.st-depose {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        &.st-attente {
          background: #dbeafe;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        &.st-accepte {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        &.st-refuse {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }
        &.st-inscrit {
          background: #d1fae5;
          color: #064e3b;
          border: 1px solid #6ee7b7;
          font-weight: 800;
        }
        &.st-default {
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
      }

      .edt-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.4rem 0.75rem;
        border: 1px solid #dbeafe;
        border-radius: 8px;
        background: #eff6ff;
        color: #2563eb;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s;
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
        &:hover {
          background: #dbeafe;
        }
      }
      .edt-btn-block {
        width: 100%;
        justify-content: center;
        margin-top: 0.5rem;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }

      .presence-btn {
        border-color: #ede9fe;
        background: #f5f3ff;
        color: #7c3aed;
        &:hover {
          background: #ede9fe;
        }
      }

      .new-badge {
        font-size: 0.65rem;
        font-weight: 700;
        color: #059669;
        background: #d1fae5;
        padding: 0.1rem 0.5rem;
        border-radius: 10px;
      }

      // ── Cartes mobile ─────────────────────────────────────────────────────────
      .cards-mobile {
        display: none;
        flex-direction: column;
        gap: 0.75rem;
      }

      .mobile-card {
        background: white;
        border-radius: 12px;
        border: 1px solid #f1f5f9;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        overflow: hidden;
        &.new {
          border-color: #a7f3d0;
          background: #f0fdf4;
        }

        .mc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .mc-body {
          padding: 0.75rem 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .mc-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.82rem;
          .mc-label {
            color: #94a3b8;
            font-weight: 600;
            font-size: 0.75rem;
          }
          span:last-child {
            color: #1e293b;
            font-weight: 500;
          }
        }
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 768px) {
        .portal-wrapper {
          padding: 1rem;
        }
        .portal-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }
        .table-wrapper {
          display: none;
        }
        .cards-mobile {
          display: flex;
        }
      }
    `
  ]
})
export class PortalDashboardComponent implements OnInit {
  private authService = inject(TuteurAuthService);
  private keycloakService = inject(KeycloakService);
  private validationService = inject(ValidationService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private presenceService = inject(PresenceService);

  userName = 'Parent';
  userInitial = 'P';
  dossiers: any[] = [];
  dossiersFiltres: any[] = [];
  presencesEnfants: PresenceEnfant[] = [];
  recherche = '';
  loadingDossiers = false;
  inscriptionSuccess = false;
  paiementConfirme = false;
  montantPaye: number | null = null;
  newDossierId: number | null = null;

  async ngOnInit() {
    const navState = window.history.state;
    if (navState?.inscriptionSuccess) {
      this.inscriptionSuccess = true;
      this.paiementConfirme = !!navState.paiementConfirme;
      this.montantPaye = navState.montant ?? null;
      this.newDossierId = navState.dossierId || null;
    }

    try {
      if (await this.keycloakService.isLoggedIn()) {
        const profile = await this.keycloakService.loadUserProfile();
        this.userName = profile.firstName || 'Parent';
        this.userInitial = this.userName.charAt(0).toUpperCase();
      }
    } catch {
      // Keycloak non initialisé (timeout au démarrage) — on continue quand même
    }

    this.loadDossiers();
    this.presenceService.getMesEnfants().subscribe({
      next: (res: any) => {
        this.presencesEnfants = res.data ?? (Array.isArray(res) ? res : []);
      },
      error: () => {
        // Silencieux : le bouton "Présences" restera juste masqué s'il n'y a pas de données.
      }
    });
  }

  loadDossiers(): void {
    this.loadingDossiers = true;
    this.validationService.getMesDossiers().subscribe({
      next: (data: any) => {
        this.dossiers = Array.isArray(data) ? data : data?.data || [];
        this.dossiersFiltres = [...this.dossiers];
        this.loadingDossiers = false;
      },
      error: () => {
        this.loadingDossiers = false;
      }
    });
  }

  filtrer(): void {
    const q = this.recherche.toLowerCase().trim();
    if (!q) {
      this.dossiersFiltres = [...this.dossiers];
      return;
    }
    this.dossiersFiltres = this.dossiers.filter((d) => {
      const nom = `${d.elevePrenom || ''} ${d.eleveNom || ''}`.toLowerCase();
      const classe = (d.classeLibelle || '').toLowerCase();
      const annee = (d.anneeScolaireLibelle || '').toLowerCase();
      const statut = (d.statutLibelle || '').toLowerCase();
      const numero = (d.numero || '').toLowerCase();
      return (
        nom.includes(q) ||
        classe.includes(q) ||
        annee.includes(q) ||
        statut.includes(q) ||
        numero.includes(q)
      );
    });
  }

  canVoirEmploiDuTemps(d: any): boolean {
    return ['ACCEPTE', 'INSCRIT'].includes(d.statutCode) && !!d.classeId && !!d.anneeScolaireId;
  }

  voirEmploiDuTemps(d: any): void {
    this.dialog.open(PortalEmploiDuTempsDialogComponent, {
      width: '720px',
      data: {
        classeId: d.classeId,
        anneeScolaireId: d.anneeScolaireId,
        classeLibelle: d.classeLibelle,
        eleveNom: d.eleveNom,
        elevePrenom: d.elevePrenom
      },
      panelClass: 'professional-dialog'
    });
  }

  canVoirPresences(d: any): boolean {
    return ['ACCEPTE', 'INSCRIT'].includes(d.statutCode) && !!d.eleveId;
  }

  voirPresences(d: any): void {
    const enfant = this.presencesEnfants.find((e) => e.eleveId === d.eleveId);
    this.dialog.open(PresenceHistoriqueDialogComponent, {
      width: '600px',
      data: {
        eleveNomComplet: `${d.elevePrenom} ${d.eleveNom}`,
        historique: enfant?.historique ?? []
      },
      panelClass: 'professional-dialog'
    });
  }

  getStatutClass(code: string): string {
    const map: Record<string, string> = {
      DEPOSE: 'st-depose',
      EN_ATTENTE: 'st-attente',
      ACCEPTE: 'st-accepte',
      REFUSE: 'st-refuse',
      INSCRIT: 'st-inscrit'
    };
    return map[code] || 'st-default';
  }

  logout() {
    this.authService.logout();
  }
}
