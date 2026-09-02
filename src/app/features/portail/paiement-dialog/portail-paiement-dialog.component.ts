import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../../core/services/notification.service';
import { FedaPayService } from '../../../core/services/fedapay.service';
import {
  PortailPaiementService,
  SuiviFrais,
  SuiviPaiement,
  SuiviTranche
} from '../../../core/services/portail-paiement.service';

interface DialogData {
  dossierId: number;
  eleveNomComplet: string;
  classeLibelle?: string;
  anneeScolaireLibelle?: string;
}

@Component({
  selector: 'app-portail-paiement-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="pp-dialog">
      <div class="pp-header">
        <mat-icon class="pp-icon">payments</mat-icon>
        <div>
          <h3>Frais &amp; paiements</h3>
          <p class="pp-sub">
            {{ data.eleveNomComplet }}
            <span *ngIf="data.classeLibelle"> · {{ data.classeLibelle }}</span>
            <span *ngIf="data.anneeScolaireLibelle"> · {{ data.anneeScolaireLibelle }}</span>
          </p>
        </div>
        <button mat-icon-button (click)="dialogRef.close(rechargerDemande)">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="pp-body">
        <div class="pp-loading" *ngIf="loading">
          <mat-spinner diameter="30"></mat-spinner>
        </div>

        <ng-container *ngIf="!loading && suivi">
          <!-- Récapitulatif -->
          <div class="pp-totaux">
            <div class="pp-tot">
              <span class="k">Total dû</span>
              <span class="v">{{ suivi.totalDu | number: '1.0-0' }} FCFA</span>
            </div>
            <div class="pp-tot ok">
              <span class="k">Payé</span>
              <span class="v">{{ suivi.totalPaye | number: '1.0-0' }} FCFA</span>
            </div>
            <div class="pp-tot" [class.due]="suivi.totalReste > 0">
              <span class="k">Reste à payer</span>
              <span class="v">{{ suivi.totalReste | number: '1.0-0' }} FCFA</span>
            </div>
          </div>

          <div class="pp-empty" *ngIf="!suivi.frais.length">
            Aucun frais scolaire n'est configuré pour cette classe / année.
          </div>

          <!-- Un bloc par frais -->
          <div class="pp-frais" *ngFor="let f of suivi.frais">
            <div class="pp-frais-head">
              <div>
                <span class="pp-frais-nom">{{ f.typeFraisLibelle || 'Frais scolaire' }}</span>
                <span class="pp-frais-detail">
                  {{ f.montantPaye | number: '1.0-0' }} / {{ f.montantDu | number: '1.0-0' }} FCFA payés
                </span>
              </div>
              <span
                class="pp-frais-badge"
                [class.solde]="f.reste <= 0"
                [class.due]="f.reste > 0"
              >
                {{ f.reste <= 0 ? 'Soldé' : (f.reste | number: '1.0-0') + ' FCFA restants' }}
              </span>
            </div>

            <!-- Tranches : le parent peut régler la tranche de son choix -->
            <div class="pp-tranches" *ngIf="f.tranches.length">
              <div class="pp-tranche" *ngFor="let t of f.tranches">
                <div class="pp-tranche-info">
                  <span class="pp-tranche-num">Tranche {{ t.numero }}</span>
                  <span class="pp-tranche-lib">{{ t.libelle || '—' }}</span>
                  <span class="pp-tranche-date" *ngIf="t.dateEcheance">
                    échéance {{ t.dateEcheance | date: 'dd/MM/yyyy' }}
                  </span>
                </div>
                <div class="pp-tranche-right">
                  <span class="pp-tranche-montant">{{ t.montant | number: '1.0-0' }} FCFA</span>
                  <span class="pp-tranche-badge" [ngClass]="'st-' + t.statut.toLowerCase()">
                    {{ statutTranche(t.statut) }}
                  </span>
                  <button
                    class="pp-mini-payer"
                    *ngIf="f.reste > 0 && montantTranche(f, t) > 0"
                    [disabled]="!!paiementEnCours"
                    (click)="payer(f, montantTranche(f, t))"
                  >
                    Payer {{ montantTranche(f, t) | number: '1.0-0' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Choix libre du montant -->
            <div class="pp-choix" *ngIf="f.reste > 0">
              <div class="pp-libre">
                <input
                  type="number"
                  [min]="1"
                  [max]="f.reste"
                  [placeholder]="'Montant (max ' + (f.reste | number: '1.0-0') + ')'"
                  [(ngModel)]="montantLibre[f.fraisScolaireId]"
                  [disabled]="!!paiementEnCours"
                />
                <button
                  class="pp-mini-payer"
                  [disabled]="!!paiementEnCours || !montantLibreValide(f)"
                  (click)="payer(f, montantLibre[f.fraisScolaireId])"
                >
                  Payer
                </button>
              </div>
              <button
                class="pp-payer"
                [disabled]="!!paiementEnCours"
                (click)="payer(f, f.reste)"
              >
                <mat-spinner *ngIf="paiementEnCours === f.fraisScolaireId" diameter="16"></mat-spinner>
                <mat-icon *ngIf="paiementEnCours !== f.fraisScolaireId">smartphone</mat-icon>
                Tout payer ({{ f.reste | number: '1.0-0' }} FCFA)
              </button>
            </div>
          </div>

          <p class="pp-note">
            Paiement Mobile Money (MTN MoMo · Moov Money) sécurisé par FedaPay.
          </p>
        </ng-container>
      </div>

      <div class="pp-footer">
        <button mat-button (click)="dialogRef.close(rechargerDemande)">Fermer</button>
      </div>
    </div>
  `,
  styles: [
    `
      .pp-dialog {
        display: flex;
        flex-direction: column;
        max-height: 82vh;
        font-family: 'Inter', sans-serif;
      }
      .pp-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem 1.25rem;
        border-bottom: 1px solid #e2e8f0;
        h3 {
          margin: 0;
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
        }
        .pp-sub {
          margin: 0;
          font-size: 0.78rem;
          color: #64748b;
        }
        button {
          margin-left: auto;
        }
      }
      .pp-icon {
        color: #2563eb;
      }
      .pp-body {
        padding: 1rem 1.25rem;
        overflow-y: auto;
      }
      .pp-loading {
        display: flex;
        justify-content: center;
        padding: 2rem;
      }
      .pp-totaux {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.6rem;
        margin-bottom: 1rem;
      }
      .pp-tot {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 0.6rem 0.75rem;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        gap: 2px;
        .k {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #94a3b8;
          font-weight: 700;
        }
        .v {
          font-size: 0.95rem;
          font-weight: 800;
          color: #1e293b;
        }
        &.ok .v {
          color: #059669;
        }
        &.due {
          background: #fef2f2;
          border-color: #fecaca;
          .v {
            color: #b91c1c;
          }
        }
      }
      .pp-empty {
        text-align: center;
        color: #94a3b8;
        padding: 1.5rem;
        font-size: 0.85rem;
      }
      .pp-frais {
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 0.85rem 1rem;
        margin-bottom: 0.75rem;
      }
      .pp-frais-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.5rem;
      }
      .pp-frais-nom {
        display: block;
        font-weight: 800;
        color: #1e293b;
        font-size: 0.92rem;
      }
      .pp-frais-detail {
        font-size: 0.78rem;
        color: #64748b;
      }
      .pp-frais-badge {
        font-size: 0.7rem;
        font-weight: 800;
        padding: 0.2rem 0.6rem;
        border-radius: 20px;
        white-space: nowrap;
        &.solde {
          background: #d1fae5;
          color: #065f46;
        }
        &.due {
          background: #fef3c7;
          color: #92400e;
        }
      }
      .pp-tranches {
        margin-top: 0.6rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .pp-tranche {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        background: #f8fafc;
        border-radius: 8px;
        padding: 0.45rem 0.6rem;
      }
      .pp-tranche-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .pp-tranche-num {
        font-weight: 700;
        font-size: 0.78rem;
        color: #334155;
      }
      .pp-tranche-lib {
        font-size: 0.75rem;
        color: #64748b;
      }
      .pp-tranche-date {
        font-size: 0.7rem;
        color: #94a3b8;
      }
      .pp-tranche-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .pp-tranche-montant {
        font-size: 0.78rem;
        font-weight: 700;
        color: #1e293b;
      }
      .pp-tranche-badge {
        font-size: 0.65rem;
        font-weight: 800;
        padding: 0.15rem 0.5rem;
        border-radius: 12px;
        &.st-payee {
          background: #d1fae5;
          color: #065f46;
        }
        &.st-partielle {
          background: #dbeafe;
          color: #1d4ed8;
        }
        &.st-en_retard {
          background: #fee2e2;
          color: #991b1b;
        }
        &.st-en_attente {
          background: #f1f5f9;
          color: #64748b;
        }
      }
      .pp-payer {
        margin-top: 0.6rem;
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0.6rem;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        &:hover:not(:disabled) {
          background: #1d4ed8;
        }
        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        mat-icon {
          font-size: 17px;
          width: 17px;
          height: 17px;
        }
      }
      .pp-mini-payer {
        border: 1px solid #2563eb;
        background: #eff6ff;
        color: #1d4ed8;
        font-weight: 700;
        font-size: 0.72rem;
        padding: 0.28rem 0.55rem;
        border-radius: 6px;
        cursor: pointer;
        white-space: nowrap;
        &:hover:not(:disabled) {
          background: #dbeafe;
        }
        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
      .pp-choix {
        margin-top: 0.7rem;
        border-top: 1px dashed #e2e8f0;
        padding-top: 0.7rem;
      }
      .pp-libre {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.5rem;
        input {
          flex: 1;
          min-width: 0;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.5rem 0.6rem;
          font-size: 0.85rem;
          outline: none;
          &:focus {
            border-color: #2563eb;
          }
        }
        .pp-mini-payer {
          padding: 0.5rem 0.9rem;
          font-size: 0.8rem;
        }
      }
      .pp-note {
        font-size: 0.72rem;
        color: #94a3b8;
        text-align: center;
        margin: 0.5rem 0 0;
      }
      .pp-footer {
        padding: 0.75rem 1.25rem;
        border-top: 1px solid #e2e8f0;
        text-align: right;
      }
      @media (max-width: 520px) {
        .pp-totaux {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class PortailPaiementDialogComponent implements OnInit {
  private paiementService = inject(PortailPaiementService);
  private fedaPay = inject(FedaPayService);
  private notification = inject(NotificationService);

  suivi: SuiviPaiement | null = null;
  loading = true;
  /** id du frais en cours de paiement (spinner sur le bon bouton), ou null. */
  paiementEnCours: number | null = null;
  /** true si un paiement a abouti → la liste parente doit se recharger à la fermeture. */
  rechargerDemande = false;
  /** montant libre saisi par le parent, par frais. */
  montantLibre: Record<number, number | null> = {};

  constructor(
    public dialogRef: MatDialogRef<PortailPaiementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.charger();
  }

  private charger(): void {
    this.loading = true;
    this.paiementService.getSuivi(this.data.dossierId).subscribe({
      next: (s) => {
        this.suivi = s;
        this.loading = false;
      },
      error: (err) => {
        this.notification.error(err?.error?.message || 'Impossible de charger les frais.');
        this.loading = false;
      }
    });
  }

  statutTranche(statut: string): string {
    return (
      {
        PAYEE: 'Payée',
        PARTIELLE: 'Partielle',
        EN_RETARD: 'En retard',
        EN_ATTENTE: 'En attente'
      } as Record<string, string>
    )[statut] || statut;
  }

  /** Montant proposé pour régler une tranche : son restant, plafonné au reste du frais. */
  montantTranche(frais: SuiviFrais, tranche: SuiviTranche): number {
    const restantTranche = Math.max(0, Math.round(tranche.montant - tranche.montantAlloue));
    return Math.min(restantTranche, Math.round(frais.reste));
  }

  montantLibreValide(frais: SuiviFrais): boolean {
    const v = Number(this.montantLibre[frais.fraisScolaireId]);
    return Number.isFinite(v) && v >= 1 && v <= Math.round(frais.reste);
  }

  async payer(frais: SuiviFrais, montant?: number | null): Promise<void> {
    if (this.paiementEnCours) return;
    const montantArrondi = montant != null ? Math.round(Number(montant)) : null;
    if (montantArrondi != null && (montantArrondi < 1 || montantArrondi > Math.round(frais.reste))) {
      this.notification.error('Montant invalide.');
      return;
    }
    this.paiementEnCours = frais.fraisScolaireId;

    this.paiementService.initPaiement(this.data.dossierId, frais.fraisScolaireId, montantArrondi).subscribe({
      next: async (init) => {
        const resultat = await this.fedaPay.payer(init.publicKey, init.fedapayTransactionId);

        if (resultat === 'annule') {
          this.paiementEnCours = null;
          this.notification.info('Paiement annulé.');
          return;
        }
        if (resultat === 'echec') {
          this.paiementEnCours = null;
          this.notification.error("Le module de paiement n'a pas pu s'ouvrir. Réessayez.");
          return;
        }

        // Le widget s'est terminé : on confirme le statut réel côté backend.
        this.paiementService.verifierPaiement(init.fedapayTransactionId).subscribe({
          next: (statut) => {
            this.paiementEnCours = null;
            if (statut.paye) {
              this.rechargerDemande = true;
              this.montantLibre = {};
              this.notification.success(
                `Paiement de ${init.montant.toLocaleString('fr-FR')} FCFA reçu.`
              );
              this.charger();
            } else {
              this.notification.warning(
                'Le paiement n\'a pas été confirmé. Si le montant a été débité, il sera pris en compte sous peu.'
              );
            }
          },
          error: () => {
            this.paiementEnCours = null;
            this.notification.warning('Impossible de confirmer le paiement pour le moment.');
          }
        });
      },
      error: (err) => {
        this.paiementEnCours = null;
        this.notification.error(err?.error?.message || "Impossible de démarrer le paiement.");
      }
    });
  }
}
