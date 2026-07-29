import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmploiDuTempsService } from '../../../core/services/emploi-du-temps.service';
import { EmploiDuTemps } from '../../../core/models/emploi-du-temps.model';

interface EmploiDuTempsDialogData {
  classeId: number;
  anneeScolaireId: number;
  classeLibelle?: string;
  eleveNom?: string;
  elevePrenom?: string;
}

@Component({
  selector: 'app-portal-emploi-du-temps-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="edt-dialog">
      <div class="edt-header">
        <mat-icon class="edt-icon">calendar_month</mat-icon>
        <div>
          <h3>Emploi du temps</h3>
          <p class="edt-sub">
            {{ data.elevePrenom }} {{ data.eleveNom }} · {{ data.classeLibelle }}
          </p>
        </div>
        <button mat-icon-button (click)="dialogRef.close()"><mat-icon>close</mat-icon></button>
      </div>

      <div class="edt-body">
        <div *ngIf="loading" class="edt-loading">
          <mat-spinner diameter="32"></mat-spinner>
        </div>

        <div class="edt-grid" *ngIf="!loading">
          <div class="edt-day-col" *ngFor="let j of jours">
            <div class="edt-day-header">{{ j.label }}</div>
            <div class="edt-empty" *ngIf="seancesDuJour(j.code).length === 0">Aucun cours</div>
            <div class="edt-card" *ngFor="let s of seancesDuJour(j.code)">
              <div class="edt-heure">{{ s.heureDebut }}–{{ s.heureFin }}</div>
              <div class="edt-matiere">{{ s.matiereLibelle }}</div>
              <div class="edt-prof">{{ s.profNomComplet }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="edt-footer">
        <button mat-button (click)="dialogRef.close()">Fermer</button>
      </div>
    </div>
  `,
  styles: [
    `
      .edt-dialog {
        min-width: 640px;
        max-width: 100%;
      }
      .edt-header {
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
      .edt-icon {
        color: #2563eb;
        font-size: 26px;
        width: 26px;
        height: 26px;
      }
      .edt-sub {
        margin: 2px 0 0;
        font-size: 12px;
        color: #64748b;
      }
      .edt-body {
        padding: 20px 24px;
        min-height: 160px;
      }
      .edt-loading {
        display: flex;
        justify-content: center;
        padding: 32px;
      }
      .edt-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 0.6rem;
      }
      .edt-day-col {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        min-width: 0;
      }
      .edt-day-header {
        text-align: center;
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: white;
        background: #374151;
        border-radius: 6px;
        padding: 0.4rem;
      }
      .edt-empty {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 60px;
        border: 1px dashed #e2e8f0;
        border-radius: 6px;
        color: #cbd5e1;
        font-size: 0.65rem;
      }
      .edt-card {
        background: white;
        border: 1px solid #e2e8f0;
        border-left: 3px solid #2563eb;
        border-radius: 6px;
        padding: 0.45rem 0.55rem;
      }
      .edt-heure {
        font-size: 0.65rem;
        font-weight: 700;
        color: #1e293b;
      }
      .edt-matiere {
        font-size: 0.72rem;
        font-weight: 600;
        color: #374151;
        margin-top: 1px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .edt-prof {
        font-size: 0.64rem;
        color: #94a3b8;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .edt-footer {
        display: flex;
        justify-content: flex-end;
        padding: 12px 24px;
        border-top: 1px solid #f1f5f9;
      }
      @media (max-width: 700px) {
        .edt-dialog {
          min-width: 0;
        }
        .edt-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `
  ]
})
export class PortalEmploiDuTempsDialogComponent implements OnInit {
  private emploiDuTempsService = inject(EmploiDuTempsService);

  planning: EmploiDuTemps[] = [];
  loading = true;

  readonly jours = [
    { code: 'LUNDI', label: 'Lundi' },
    { code: 'MARDI', label: 'Mardi' },
    { code: 'MERCREDI', label: 'Mercredi' },
    { code: 'JEUDI', label: 'Jeudi' },
    { code: 'VENDREDI', label: 'Vendredi' },
    { code: 'SAMEDI', label: 'Samedi' }
  ];

  constructor(
    public dialogRef: MatDialogRef<PortalEmploiDuTempsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmploiDuTempsDialogData
  ) {}

  ngOnInit(): void {
    this.emploiDuTempsService.getByClasse(this.data.classeId, this.data.anneeScolaireId).subscribe({
      next: (res: any) => {
        this.planning = res.data ?? (Array.isArray(res) ? res : []);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  seancesDuJour(jourCode: string): EmploiDuTemps[] {
    return this.planning.filter((s) => s.jour === jourCode);
  }
}
