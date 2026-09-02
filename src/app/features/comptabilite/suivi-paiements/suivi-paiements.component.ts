import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { DossierEleveService } from '../../../core/services/dossier-eleve.service';
import { SuiviPaiementService } from '../../../core/services/suivi-paiement.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DossierEleve } from '../../../core/models/dossier-eleve.model';
import { SuiviPaiement } from '../../../core/models/suivi-paiement.model';
import { PaiementFormDialogComponent } from '../paiements/paiement-form-dialog/paiement-form-dialog.component';

@Component({
  selector: 'app-suivi-paiements',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NgSelectModule
  ],
  templateUrl: './suivi-paiements.component.html',
  styleUrl: './suivi-paiements.component.scss'
})
export class SuiviPaiementsComponent implements OnInit {
  private dossierEleveService = inject(DossierEleveService);
  private suiviPaiementService = inject(SuiviPaiementService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  dossiers: (DossierEleve & { nomComplet?: string })[] = [];
  dossierEleveId: number | null = null;
  suivi: SuiviPaiement | null = null;
  loadingDossiers = false;
  loadingSuivi = false;

  ngOnInit(): void {
    this.loadingDossiers = true;
    this.dossierEleveService.getAll(1, 300).subscribe((res) => {
      const liste: DossierEleve[] = res.data || res || [];
      // Seuls les dossiers acceptés / inscrits ont une scolarité à payer.
      this.dossiers = liste
        .filter((d: any) => ['ACCEPTE', 'INSCRIT'].includes(d.statutCode))
        .map((d) => ({
          ...d,
          nomComplet: `${d.eleveNom ?? ''} ${d.elevePrenom ?? ''} — ${d.classeLibelle ?? ''}`
        }));
      this.loadingDossiers = false;
    });
  }

  onDossierChange(): void {
    this.suivi = null;
    if (!this.dossierEleveId) return;
    this.loadingSuivi = true;
    this.suiviPaiementService.getSuiviParDossier(this.dossierEleveId).subscribe({
      next: (result) => {
        this.suivi = result;
        this.loadingSuivi = false;
      },
      error: () => {
        this.notification.error('Impossible de charger le suivi de paiement');
        this.loadingSuivi = false;
      }
    });
  }

  nouveauPaiement(): void {
    if (!this.dossierEleveId) return;
    this.dialog
      .open(PaiementFormDialogComponent, {
        width: '560px',
        maxWidth: '95vw',
        panelClass: 'professional-dialog',
        data: { dossierEleveId: this.dossierEleveId }
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.onDossierChange();
      });
  }

  statutLabel(statut: string): string {
    switch (statut) {
      case 'PAYEE':
        return 'Payée';
      case 'PARTIELLE':
        return 'Partielle';
      case 'EN_RETARD':
        return 'En retard';
      default:
        return 'En attente';
    }
  }
}
