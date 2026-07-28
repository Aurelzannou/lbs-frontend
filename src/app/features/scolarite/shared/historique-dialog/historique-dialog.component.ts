import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HistoriqueService } from '../../../../core/services/historique.service';

@Component({
  selector: 'app-historique-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="hist-dialog">
      <div class="hist-header">
        <mat-icon class="hist-icon">history</mat-icon>
        <div>
          <h3>Historique du dossier</h3>
          <p class="hist-numero">{{ data.numero }}</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="hist-body">
        <div *ngIf="loading" class="hist-loading">
          <mat-spinner diameter="32"></mat-spinner>
        </div>

        <div *ngIf="!loading && historique.length === 0" class="hist-empty">
          Aucun historique disponible.
        </div>

        <div class="hist-timeline" *ngIf="!loading && historique.length > 0">
          <div class="hist-item" *ngFor="let h of historique">
            <div class="hist-dot" [ngClass]="getActionClass(h.action)"></div>
            <div class="hist-content">
              <div class="hist-action">
                <span class="hist-badge" [ngClass]="getActionClass(h.action)">{{
                  getActionLabel(h.action)
                }}</span>
                <span class="hist-par">par {{ h.effectuePar }}</span>
              </div>
              <div class="hist-date">{{ h.effectueLe | date: 'dd/MM/yyyy à HH:mm' }}</div>
              <div class="hist-commentaire" *ngIf="h.commentaire">{{ h.commentaire }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="hist-footer">
        <button mat-button (click)="dialogRef.close()">Fermer</button>
      </div>
    </div>
  `,
  styles: [
    `
      .hist-dialog {
        min-width: 480px;
      }
      .hist-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 20px 24px;
        border-bottom: 1px solid #f1f5f9;
        h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #64748b;
          font-family: monospace;
        }
        button {
          margin-left: auto;
        }
      }
      .hist-icon {
        color: #6366f1;
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
      .hist-body {
        padding: 20px 24px;
        min-height: 120px;
      }
      .hist-loading,
      .hist-empty {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 32px;
        color: #94a3b8;
      }
      .hist-timeline {
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .hist-item {
        display: flex;
        gap: 16px;
        padding: 12px 0;
        border-left: 2px solid #e2e8f0;
        margin-left: 8px;
        padding-left: 20px;
        position: relative;
      }
      .hist-dot {
        position: absolute;
        left: -7px;
        top: 16px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid #fff;
        &.depose {
          background: #f59e0b;
        }
        &.accepte {
          background: #22c55e;
        }
        &.refuse {
          background: #ef4444;
        }
        &.inscrit {
          background: #6366f1;
        }
      }
      .hist-content {
        flex: 1;
      }
      .hist-action {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }
      .hist-badge {
        padding: 2px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
        &.depose {
          background: #fef3c7;
          color: #92400e;
        }
        &.accepte {
          background: #dcfce7;
          color: #166534;
        }
        &.refuse {
          background: #fee2e2;
          color: #991b1b;
        }
        &.inscrit {
          background: #ede9fe;
          color: #5b21b6;
        }
      }
      .hist-par {
        font-size: 12px;
        color: #64748b;
      }
      .hist-date {
        font-size: 12px;
        color: #94a3b8;
      }
      .hist-commentaire {
        font-size: 13px;
        color: #475569;
        margin-top: 4px;
        font-style: italic;
      }
      .hist-footer {
        display: flex;
        justify-content: flex-end;
        padding: 12px 24px;
        border-top: 1px solid #f1f5f9;
      }
    `
  ]
})
export class HistoriqueDialogComponent implements OnInit {
  private historiqueService = inject(HistoriqueService);

  historique: any[] = [];
  loading = true;

  constructor(
    public dialogRef: MatDialogRef<HistoriqueDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { uuid: string; numero: string }
  ) {}

  ngOnInit(): void {
    this.historiqueService.getByDossier(this.data.uuid).subscribe({
      next: (res: any) => {
        this.historique = res.data ?? (Array.isArray(res) ? res : []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getActionClass(action: string): string {
    const map: Record<string, string> = {
      DEPOSE: 'depose',
      ACCEPTE: 'accepte',
      REFUSE: 'refuse',
      INSCRIT: 'inscrit'
    };
    return map[action] || 'depose';
  }

  getActionLabel(action: string): string {
    const map: Record<string, string> = {
      DEPOSE: 'Déposé',
      ACCEPTE: 'Accepté',
      REFUSE: 'Refusé',
      INSCRIT: 'Inscrit'
    };
    return map[action] || action;
  }
}
