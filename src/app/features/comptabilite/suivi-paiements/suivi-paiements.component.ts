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
import { AnneeScolaireService } from '../../../core/services/annee-scolaire.service';
import { ClasseService } from '../../../core/services/classe.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DossierEleve } from '../../../core/models/dossier-eleve.model';
import { SuiviPaiement } from '../../../core/models/suivi-paiement.model';
import { AnneeScolaire } from '../../../core/models/annee-scolaire.model';
import { Classe } from '../../../core/models/classe.model';
import { SuiviGlobalLigne } from '../../../core/models/suivi-global-ligne.model';
import { PaiementFormDialogComponent } from '../paiements/paiement-form-dialog/paiement-form-dialog.component';
import { PdfPreviewDialogComponent } from '../../notes/pdf-preview-dialog/pdf-preview-dialog.component';

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
  private anneeService = inject(AnneeScolaireService);
  private classeService = inject(ClasseService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  /** « eleve » = suivi d'un dossier choisi (comportement historique) ; « global » = tableau de
      tous les impayés, toutes années confondues par défaut. */
  mode: 'eleve' | 'global' = 'eleve';

  dossiers: (DossierEleve & { nomComplet?: string })[] = [];
  dossierEleveId: number | null = null;
  suivi: SuiviPaiement | null = null;
  loadingDossiers = false;
  loadingSuivi = false;

  annees: (AnneeScolaire | { id: null; libelle: string })[] = [];
  /** Filtre (mode « par élève ») par défaut sur l'année scolaire active. */
  anneeScolaireId: number | null = null;

  // ===== Mode « Tous les impayés » =====
  impayes: SuiviGlobalLigne[] = [];
  loadingImpayes = false;
  impayesCharges = false;
  classesImpayes: (Classe | { id: null; libelle: string })[] = [];
  classeImpayesId: number | null = null;
  /** Défaut « Toutes les années » (null) — c'est tout l'intérêt de cette vue par rapport au
      suivi élève par élève, qui lui reste cantonné à l'année active. */
  anneeImpayesId: number | null = null;
  statutImpayes: string | null = null;
  exportImpayesEnCours = false;
  /** Renseigné quand on ouvre le détail d'un dossier depuis le tableau des impayés — sert à
      afficher un fil d'Ariane et à revenir au tableau plutôt qu'au sélecteur d'élève. */
  impayeSelectionne: SuiviGlobalLigne | null = null;

  ngOnInit(): void {
    this.anneeService.getAll(0, 50).subscribe((res: any) => {
      const page = res.data ?? res;
      const list: AnneeScolaire[] = page.data ?? (Array.isArray(page) ? page : []);
      this.annees = [{ id: null, libelle: 'Toutes les années' }, ...list];
      const active = list.find((a) => a.actif);
      this.anneeScolaireId = active?.id ?? null;
      this.loadDossiers();
    });
    this.classeService.getAll(1, 100).subscribe((res: any) => {
      const list = res.data ?? (Array.isArray(res) ? res : []);
      this.classesImpayes = [{ id: null, libelle: 'Toutes les classes' }, ...list];
    });
  }

  switchMode(mode: 'eleve' | 'global'): void {
    this.mode = mode;
    if (mode === 'global' && !this.impayesCharges) {
      this.impayesCharges = true;
      this.chargerImpayes();
    }
  }

  /** Un élève changé de filtre d'année → sa sélection courante n'est plus forcément valable,
      on la remet à zéro pour éviter d'afficher un suivi hors du périmètre affiché. */
  onAnneeChange(): void {
    this.dossierEleveId = null;
    this.suivi = null;
    this.loadDossiers();
  }

  loadDossiers(): void {
    this.loadingDossiers = true;
    this.dossierEleveService.getAll(1, 300, '', this.anneeScolaireId).subscribe((res) => {
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

  /** Choix manuel dans le sélecteur d'élève — distinct de la navigation programmatique depuis le
      tableau des impayés, pour ne pas effacer le fil d'Ariane dans ce second cas. */
  onDossierPickedManually(): void {
    this.impayeSelectionne = null;
    this.onDossierChange();
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
        if (!result) return;
        this.onDossierChange();
        // Le paiement change le reste-à-payer de ce dossier — le tableau des impayés déjà
        // chargé doit être resynchronisé, qu'on y revienne ou non tout de suite.
        if (this.impayesCharges) this.chargerImpayes();
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

  // ===== Mode « Tous les impayés » =====

  onFiltreImpayesChange(): void {
    this.chargerImpayes();
  }

  chargerImpayes(): void {
    this.loadingImpayes = true;
    this.suiviPaiementService
      .listerImpayes(this.anneeImpayesId, this.classeImpayesId, this.statutImpayes)
      .subscribe({
        next: (res: any) => {
          this.impayes = res.data ?? (Array.isArray(res) ? res : []);
          this.loadingImpayes = false;
        },
        error: () => {
          this.notification.error('Impossible de charger la liste des impayés');
          this.loadingImpayes = false;
        }
      });
  }

  get effectifImpayes(): number {
    return this.impayes.length;
  }
  get totalDuImpayes(): number {
    return this.impayes.reduce((s, l) => s + (l.totalDu || 0), 0);
  }
  get totalPayeImpayes(): number {
    return this.impayes.reduce((s, l) => s + (l.totalPaye || 0), 0);
  }
  get totalResteImpayes(): number {
    return this.impayes.reduce((s, l) => s + (l.totalReste || 0), 0);
  }

  statutGlobalLabel(statut: string): string {
    switch (statut) {
      case 'EN_RETARD':
        return 'En retard';
      case 'PARTIELLE':
        return 'Partiel';
      default:
        return 'En attente';
    }
  }

  /** Ouvre le détail (échéancier, bouton "Nouveau paiement") d'une ligne du tableau global —
      réutilise le mode « par élève » sans repasser par son sélecteur. */
  voirDetailImpaye(ligne: SuiviGlobalLigne): void {
    this.impayeSelectionne = ligne;
    this.mode = 'eleve';
    this.dossierEleveId = ligne.dossierEleveId;
    this.onDossierChange();
  }

  retourImpayes(): void {
    this.impayeSelectionne = null;
    this.dossierEleveId = null;
    this.suivi = null;
    this.mode = 'global';
  }

  exporterImpayesPdf(): void {
    if (this.exportImpayesEnCours) return;
    this.exportImpayesEnCours = true;
    this.suiviPaiementService
      .telechargerImpayesPdf(this.anneeImpayesId, this.classeImpayesId, this.statutImpayes)
      .subscribe({
        next: (blob) => {
          this.dialog.open(PdfPreviewDialogComponent, {
            width: '820px',
            maxWidth: '95vw',
            height: '90vh',
            maxHeight: '92vh',
            panelClass: 'professional-dialog',
            data: { blob, filename: 'liste-impayes.pdf', title: 'Liste des impayés' }
          });
          this.exportImpayesEnCours = false;
        },
        error: () => {
          this.notification.error('Impossible de générer le PDF des impayés');
          this.exportImpayesEnCours = false;
        }
      });
  }
}
