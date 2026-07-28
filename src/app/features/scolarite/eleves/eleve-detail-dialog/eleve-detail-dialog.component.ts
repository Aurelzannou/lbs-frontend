import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Eleve } from '../../../../core/models/eleve.model';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-eleve-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="det-dialog">
      <div class="det-header">
        <div class="det-icon-box">
          <mat-icon>person</mat-icon>
        </div>
        <div class="det-title-group">
          <h3>Détails de l'élève</h3>
          <p class="det-subtitle">Informations complètes du dossier</p>
        </div>
        <button mat-icon-button (click)="close()" class="det-close">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="det-body">
        <div class="det-profile">
          <div class="det-avatar">{{ data.nom[0] }}{{ data.prenom[0] }}</div>
          <div class="det-name">{{ data.nom }} {{ data.prenom }}</div>
          <span class="det-role-tag">Élève</span>
        </div>

        <div class="det-grid">
          <div class="det-item">
            <label>Nom</label>
            <span>{{ data.nom }}</span>
          </div>
          <div class="det-item">
            <label>Prénom(s)</label>
            <span>{{ data.prenom }}</span>
          </div>
          <div class="det-item">
            <label>Sexe</label>
            <span class="det-badge" [ngClass]="data.sexe === 'M' ? 'blue' : 'pink'">
              {{ data.sexe === 'M' ? 'Masculin' : 'Féminin' }}
            </span>
          </div>
          <div class="det-item">
            <label>Classe</label>
            <span class="det-badge indigo" *ngIf="data.classe">{{ data.classe.code }}</span>
            <span class="det-muted" *ngIf="!data.classe">Non assignée</span>
          </div>
          <div class="det-item">
            <label>Date de naissance</label>
            <span>{{ data.dateNaissance ? (data.dateNaissance | date: 'dd MMMM yyyy') : '—' }}</span>
          </div>
          <div class="det-item">
            <label>Provenance</label>
            <span>{{ data.provenance || 'Non renseignée' }}</span>
          </div>
          <div class="det-item">
            <label>État de santé</label>
            <span class="det-status" [class.danger]="data.souffrant" [class.success]="!data.souffrant">
              {{ data.souffrant ? 'Souffrant' : 'En bonne santé' }}
            </span>
          </div>
          <div class="det-item">
            <label>Statut compte</label>
            <span class="det-status" [class.success]="data.actif" [class.basic]="!data.actif">
              {{ data.actif ? 'Actif' : 'Inactif' }}
            </span>
          </div>
        </div>
      </div>

      <div class="det-footer">
        <button mat-button class="det-close-btn" (click)="close()">Fermer</button>
      </div>
    </div>
  `,
  styles: [
    `
      .det-dialog {
        min-width: 480px;
      }
      .det-header {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 20px 24px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
      }
      .det-icon-box {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .det-title-group {
        flex: 1;
        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }
      }
      .det-subtitle {
        margin: 2px 0 0;
        font-size: 12px;
        color: #64748b;
      }
      .det-close {
        color: #94a3b8 !important;
        &:hover {
          background: #fee2e2 !important;
          color: #ef4444 !important;
        }
      }
      .det-body {
        padding: 24px;
        background: white;
      }
      .det-profile {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid #f1f5f9;
      }
      .det-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .det-name {
        font-size: 18px;
        font-weight: 700;
        color: #1e293b;
      }
      .det-role-tag {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #64748b;
        background: #f1f5f9;
        border-radius: 12px;
        padding: 2px 10px;
      }
      .det-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .det-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        label {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        span {
          font-size: 14px;
          font-weight: 600;
          color: #1e293b;
        }
      }
      .det-muted {
        color: #94a3b8 !important;
        font-weight: 500 !important;
      }
      .det-badge {
        padding: 3px 10px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 700;
        width: fit-content;
        &.blue {
          background: #eff6ff;
          color: #2563eb;
          border: 1px solid #dbeafe;
        }
        &.pink {
          background: #fdf2f8;
          color: #9d174d;
          border: 1px solid #fce7f3;
        }
        &.indigo {
          background: #ede9fe;
          color: #5b21b6;
          border: 1px solid #e9d5ff;
        }
      }
      .det-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-weight: 700 !important;
        &::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        &.success {
          color: #059669;
          &::before {
            background: #10b981;
          }
        }
        &.danger {
          color: #dc2626;
          &::before {
            background: #ef4444;
          }
        }
        &.basic {
          color: #64748b;
          &::before {
            background: #94a3b8;
          }
        }
      }
      .det-footer {
        display: flex;
        justify-content: flex-end;
        padding: 12px 24px;
        background: #f8fafc;
        border-top: 1px solid #e2e8f0;
      }
      .det-close-btn {
        color: #374151 !important;
        font-weight: 600 !important;
      }
    `
  ]
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
