import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PeriodeAcademiqueService } from '../../../core/services/periode-academique.service';
import { BulletinService } from '../../../core/services/bulletin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PeriodeAcademique } from '../../../core/models/periode-academique.model';

interface BulletinDialogData {
  eleveId: number;
  eleveNomComplet: string;
}

@Component({
  selector: 'app-bulletin-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="bd-dialog">
      <div class="bd-header">
        <mat-icon class="bd-icon">description</mat-icon>
        <div>
          <h3>Bulletins</h3>
          <p class="bd-sub">{{ data.eleveNomComplet }}</p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="bd-body">
        <div class="bd-empty" *ngIf="periodes.length === 0">Aucune période trouvée.</div>

        <div class="bd-row" *ngFor="let p of periodes">
          <span class="bd-libelle">{{ p.libelle }}</span>
          <button
            class="bd-download"
            (click)="telecharger(p)"
            [disabled]="telechargementEnCours === p.id"
          >
            <mat-icon>download</mat-icon>
            {{ telechargementEnCours === p.id ? '...' : 'Télécharger' }}
          </button>
        </div>
      </div>

      <div class="bd-footer">
        <button mat-button (click)="dialogRef.close()">Fermer</button>
      </div>
    </div>
  `,
  styles: [
    `
      .bd-dialog {
        min-width: 480px;
        max-width: 100%;
      }
      .bd-header {
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
      .bd-icon {
        color: #2563eb;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
      .bd-sub {
        margin: 2px 0 0;
        font-size: 12px;
        color: #64748b;
      }
      .bd-body {
        padding: 12px 16px;
        max-height: 60vh;
        overflow-y: auto;
      }
      .bd-empty {
        padding: 2.5rem 1rem;
        text-align: center;
        color: #94a3b8;
        font-size: 0.85rem;
      }
      .bd-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.65rem 0.75rem;
        border-radius: 8px;
        &:hover {
          background: #f8fafc;
        }
        & + .bd-row {
          border-top: 1px solid #f1f5f9;
        }
      }
      .bd-libelle {
        font-size: 0.9rem;
        font-weight: 600;
        color: #374151;
      }
      .bd-download {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border-radius: 6px;
        border: none;
        background: #eff6ff;
        color: #2563eb;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }
        &:hover:not(:disabled) {
          background: #dbeafe;
        }
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
      .bd-footer {
        display: flex;
        justify-content: flex-end;
        padding: 12px 24px;
        border-top: 1px solid #f1f5f9;
      }
    `
  ]
})
export class BulletinDialogComponent implements OnInit {
  private periodeService = inject(PeriodeAcademiqueService);
  private bulletinService = inject(BulletinService);
  private notification = inject(NotificationService);

  periodes: PeriodeAcademique[] = [];
  telechargementEnCours: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<BulletinDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BulletinDialogData
  ) {}

  ngOnInit(): void {
    this.periodeService.getAll(1, 50).subscribe((res: any) => {
      this.periodes = res.data ?? (Array.isArray(res) ? res : []);
    });
  }

  telecharger(periode: PeriodeAcademique): void {
    this.telechargementEnCours = periode.id!;
    this.bulletinService.telechargerPdfEleve(this.data.eleveId, periode.id!).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulletin-${this.data.eleveNomComplet}-${periode.libelle}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.telechargementEnCours = null;
      },
      error: () => {
        this.notification.error("Ce bulletin n'est pas encore disponible pour cette période.");
        this.telechargementEnCours = null;
      }
    });
  }
}
