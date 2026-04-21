import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { 
  NbCardModule, 
  NbButtonModule, 
  NbIconModule,
  NbUserModule
} from '@nebular/theme';
import { Eleve } from '../../../../core/models/eleve.model';

@Component({
  selector: 'app-eleve-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    NbCardModule,
    NbButtonModule,
    NbIconModule,
    NbUserModule
  ],
  template: `
    <div class="dialog-wrapper">
      <nb-card class="detail-card">
        <nb-card-header class="header">
          <div class="header-content">
            <div class="title-with-icon">
              <div class="icon-box">
                <nb-icon icon="person-outline"></nb-icon>
              </div>
              <div class="title-text">
                <h3>Détails de l'élève</h3>
                <p class="subtitle">Informations complètes du dossier</p>
              </div>
            </div>
            <button nbButton ghost status="basic" (click)="close()" class="close-btn">
              <nb-icon icon="close-outline"></nb-icon>
            </button>
          </div>
        </nb-card-header>

        <nb-card-body class="body">
          <div class="profile-section">
            <nb-user [name]="data.nom + ' ' + data.prenom" 
                     [title]="'Élève'"
                     size="large">
            </nb-user>
          </div>

          <div class="details-grid">
            <div class="detail-item">
              <label>Nom</label>
              <span>{{ data.nom }}</span>
            </div>
            <div class="detail-item">
              <label>Prénom(s)</label>
              <span>{{ data.prenom }}</span>
            </div>
            <div class="detail-item">
              <label>Sexe</label>
              <span class="badge" [ngClass]="data.sexe === 'M' ? 'male' : 'female'">
                {{ data.sexe === 'M' ? 'Masculin' : 'Féminin' }}
              </span>
            </div>
            <div class="detail-item">
              <label>Classe</label>
              <span class="badge male" *ngIf="data.classe">{{ data.classe.libelle }}</span>
              <span class="text-muted" *ngIf="!data.classe">Non assignée</span>
            </div>
            <div class="detail-item">
              <label>Date de Naissance</label>
              <span>{{ data.dateNaissance | date:'dd MMMM yyyy' }}</span>
            </div>
            <div class="detail-item">
              <label>Provenance</label>
              <span>{{ data.provenance || 'Non renseignée' }}</span>
            </div>
            <div class="detail-item">
              <label>État de santé</label>
              <span class="status" [class.danger]="data.souffrant" [class.success]="!data.souffrant">
                {{ data.souffrant ? 'Souffrant' : 'En bonne santé' }}
              </span>
            </div>
            <div class="detail-item">
              <label>Statut Compte</label>
              <span class="status" [class.success]="data.actif" [class.basic]="!data.actif">
                {{ data.actif ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>
        </nb-card-body>

        <nb-card-footer class="footer">
          <button nbButton status="primary" fullWidth (click)="close()">Fermer</button>
        </nb-card-footer>
      </nb-card>
    </div>
  `,
  styles: [`
    .dialog-wrapper {
      max-width: 500px;
      width: 100%;
    }
    .detail-card {
      margin: 0;
      border-radius: 1rem;
      overflow: hidden;
    }
    .header {
      background: #f8fafc;
      padding: 1.25rem 1.5rem;
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .title-with-icon {
        display: flex;
        align-items: center;
        gap: 1rem;
        .icon-box {
          width: 2.75rem;
          height: 2.75rem;
          background: #fbbf24;
          color: #451a03;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        h3 { margin: 0; font-size: 1.2rem; font-weight: 800; color: #fffbeb; letter-spacing: -0.01em; }
        .subtitle { margin: 0; font-size: 0.75rem; color: #fde68a; font-weight: 600; opacity: 0.8; }
      }
    }
    .body { padding: 2rem; }
    .profile-section {
      display: flex;
      justify-content: center;
      margin-bottom: 2.25rem;
      padding-bottom: 1.5rem;
      border-bottom: 1.5px solid #fef3c7;
      ::ng-deep nb-user {
        .user-name { font-size: 1.3rem; font-weight: 800; color: #451a03; }
        .user-title { color: #b45309; font-weight: 600; }
      }
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.75rem;
    }
    .detail-item {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      label {
        font-size: 0.7rem;
        font-weight: 800;
        color: #b45309;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }
      span {
        font-size: 1rem;
        font-weight: 600;
        color: #451a03;
      }
      .badge {
        padding: 0.25rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.75rem;
        font-weight: 700;
        width: fit-content;
        &.male { background: #fffbeb; color: #b45309; border: 1px solid #fef3c7; }
        &.female { background: #fdf2f8; color: #9d174d; border: 1px solid #fce7f3; }
      }
      .status {
        font-size: 0.85rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        &::before { content: ''; width: 8px; height: 8px; border-radius: 50%; }
        &.success { color: #059669; &::before { background: #10b981; } }
        &.danger { color: #dc2626; &::before { background: #ef4444; } }
        &.basic { color: #64748b; &::before { background: #94a3b8; } }
      }
    }
    .footer { 
      padding: 1.5rem 2rem; 
      background: #fffbeb;
      border-top: 1px solid #fef3c7;
      button { 
        height: 3rem; 
        font-weight: 800; 
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
      }
    }
  `]
})
export class EleveDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<EleveDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Eleve
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
