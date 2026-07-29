import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PresenceHistorique } from '../../../core/models/presence.model';

interface PresenceHistoriqueDialogData {
  eleveNomComplet: string;
  historique: PresenceHistorique[];
}

@Component({
  selector: 'app-presence-historique-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="ph-dialog">
      <div class="ph-header">
        <mat-icon class="ph-icon">fact_check</mat-icon>
        <div>
          <h3>Présences</h3>
          <p class="ph-sub">{{ data.eleveNomComplet }}</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="ph-body">
        <div class="ph-empty" *ngIf="data.historique.length === 0">
          Aucune présence enregistrée pour le moment.
        </div>

        <div class="ph-row" *ngFor="let h of data.historique">
          <div class="ph-date">
            <span class="ph-jour">{{ h.jour }}</span>
            <span>{{ h.date | date: 'dd/MM/yyyy' }}</span>
          </div>
          <div class="ph-info">
            <span class="ph-matiere">{{ h.matiereLibelle }}</span>
            <span class="ph-heure">{{ h.heureDebut }}–{{ h.heureFin }}</span>
          </div>
          <span class="ph-badge" [class.present]="h.statut === 'PRESENT'" [class.absent]="h.statut === 'ABSENT'">
            {{ h.statut === 'PRESENT' ? 'Présent' : 'Absent' }}
          </span>
        </div>
      </div>

      <div class="ph-footer">
        <button mat-button (click)="dialogRef.close()">Fermer</button>
      </div>
    </div>
  `,
  styles: [
    `
      .ph-dialog {
        min-width: 520px;
        max-width: 100%;
      }
      .ph-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 24px;
        border-bottom: 1px solid #f1f5f9;
        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #1e293b;
        }
        button {
          margin-left: auto;
        }
      }
      .ph-icon {
        color: #2563eb;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
      .ph-sub {
        margin: 2px 0 0;
        font-size: 12px;
        color: #64748b;
      }
      .ph-body {
        padding: 12px 16px;
        max-height: 60vh;
        overflow-y: auto;
      }
      .ph-empty {
        padding: 2.5rem 1rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.85rem;
      }
      .ph-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.65rem 0.75rem;
        border-radius: 8px;
        &:hover {
          background: #f8fafc;
        }
        & + .ph-row {
          border-top: 1px solid #f1f5f9;
        }
      }
      .ph-date {
        display: flex;
        flex-direction: column;
        min-width: 110px;
        font-size: 0.78rem;
        color: #1e293b;
        font-weight: 600;
        .ph-jour {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #94a3b8;
          font-weight: 700;
        }
      }
      .ph-info {
        display: flex;
        flex-direction: column;
        flex: 1;
        .ph-matiere {
          font-size: 0.85rem;
          font-weight: 600;
          color: #374151;
        }
        .ph-heure {
          font-size: 0.72rem;
          color: #94a3b8;
        }
      }
      .ph-badge {
        font-size: 0.72rem;
        font-weight: 700;
        padding: 0.25rem 0.7rem;
        border-radius: 20px;
        &.present {
          background: #dcfce7;
          color: #16a34a;
        }
        &.absent {
          background: #fee2e2;
          color: #dc2626;
        }
      }
      .ph-footer {
        display: flex;
        justify-content: flex-end;
        padding: 12px 24px;
        border-top: 1px solid #f1f5f9;
      }
    `
  ]
})
export class PresenceHistoriqueDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PresenceHistoriqueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PresenceHistoriqueDialogData
  ) {}
}
