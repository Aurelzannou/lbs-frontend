import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NoteService } from '../../../core/services/note.service';
import { ClasseService } from '../../../core/services/classe.service';
import { MatiereService } from '../../../core/services/matiere.service';
import { PeriodeAcademiqueService } from '../../../core/services/periode-academique.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Classe } from '../../../core/models/classe.model';
import { Matiere } from '../../../core/models/matiere.model';
import { PeriodeAcademique } from '../../../core/models/periode-academique.model';
import { FeuilleSaisieNotes, ProgressionEtapeHistorique, ProgressionSaisieNotes } from '../../../core/models/note.model';
import { NotesRosterTableComponent } from '../notes-roster-table/notes-roster-table.component';
import {
  ChoixColonnesDialogComponent,
  ColonneChoix,
  ChoixColonnesResultat
} from '../choix-colonnes-dialog.component';

@Component({
  selector: 'app-saisie-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, MatDialogModule, NgSelectModule, NotesRosterTableComponent],
  templateUrl: './saisie-notes.component.html',
  styleUrl: './saisie-notes.component.scss'
})
export class SaisieNotesComponent implements OnInit, OnDestroy {
  private noteService = inject(NoteService);
  private classeService = inject(ClasseService);
  private matiereService = inject(MatiereService);
  private periodeService = inject(PeriodeAcademiqueService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  classes: Classe[] = [];
  matieres: Matiere[] = [];
  periodes: PeriodeAcademique[] = [];

  classeId: number | null = null;
  matiereId: number | null = null;
  periodeId: number | null = null;

  /** Les matières proposées dépendent de la classe choisie (référentiel Classes) — si la classe
      n'a encore aucune matière assignée, on retombe sur la liste complète pour ne pas bloquer.
      Propriété stockée (pas un getter) : [items] sur un ng-select ne doit jamais recevoir un
      nouveau tableau à chaque cycle de détection de changement, sinon le composant perd son état
      interne et les clics sur les options cessent de fonctionner. */
  matieresDisponibles: Matiere[] = [];

  feuille: FeuilleSaisieNotes | null = null;
  progression: ProgressionSaisieNotes | null = null;
  historique: ProgressionEtapeHistorique[] = [];
  afficherHistorique = false;
  loading = false;
  saving = false;
  approbationEnCours = false;

  autoSaveStatut: 'idle' | 'saving' | 'saved' | 'erreur' = 'idle';
  private modificationSubject = new Subject<void>();
  private modificationSub?: Subscription;

  /** Le professeur est en charge de cette matière et ne l'a pas encore envoyée à l'administration :
      l'admin peut regarder mais pas modifier (le professeur travaille encore dessus). */
  get enAttenteProfesseur(): boolean {
    return !!this.feuille?.professeurAssigne && this.progression?.etape === 'BROUILLON';
  }

  get etapeReadonly(): boolean {
    return !!this.feuille?.valide || this.progression?.etape === 'VALIDEE' || this.enAttenteProfesseur;
  }

  get etapeLabel(): string {
    switch (this.progression?.etape) {
      case 'VALIDEE':
        return 'Approuvé';
      case 'SOUMISE':
        return "À approuver — reçu de l'enseignant";
      default:
        return this.feuille?.professeurAssigne ? 'En cours de saisie (enseignant)' : 'Brouillon';
    }
  }

  /** Notes reçues de l'enseignant, en attente d'approbation par l'administration. */
  get aApprouver(): boolean {
    return this.progression?.etape === 'SOUMISE';
  }

  /** Reste-t-il des colonnes reçues non approuvées ? */
  get peutApprouver(): boolean {
    if (!this.aApprouver || !this.progression) return false;
    const p = this.progression;
    return (p.interrogationsVerroueesJusqua ?? 0) > (p.interrogationsValideesJusqua ?? 0)
      || (p.devoirsVerrouesJusqua ?? 0) > (p.devoirsValideesJusqua ?? 0);
  }

  get estApprouve(): boolean {
    return this.progression?.etape === 'VALIDEE';
  }

  /** Colonnes déjà approuvées → grisées côté admin aussi. */
  get colonnesApprouveesInterro(): number {
    return this.progression?.interrogationsValideesJusqua ?? 0;
  }
  get colonnesApprouveesDevoir(): number {
    return this.progression?.devoirsValideesJusqua ?? 0;
  }

  get etapeIcon(): string {
    switch (this.progression?.etape) {
      case 'VALIDEE':
        return 'verified';
      case 'SOUMISE':
        return 'inbox';
      default:
        return 'edit_note';
    }
  }

  ngOnInit(): void {
    this.classeService.getAll(1, 100).subscribe((res: any) => {
      this.classes = res.data ?? (Array.isArray(res) ? res : []);
      this.mettreAJourMatieresDisponibles();
    });
    this.matiereService.getAll(1, 100).subscribe((res: any) => {
      this.matieres = res.data ?? (Array.isArray(res) ? res : []);
      this.mettreAJourMatieresDisponibles();
    });
    // Cet écran de saisie directe se limite à la période EN_COURS d'une année scolaire active — la
    // consultation/modification d'une autre période (À venir, Terminée) ou d'une année inactive
    // reste possible, mais uniquement depuis l'écran "Validation des bulletins" (qui garde
    // volontairement un accès à tout l'historique). Le backend applique la même règle.
    this.periodeService.getAll(1, 50).subscribe((res: any) => {
      const toutes = res.data ?? (Array.isArray(res) ? res : []);
      this.periodes = toutes.filter(
        (p: PeriodeAcademique) => !!p.anneeScolaire?.actif && p.statut === 'EN_COURS'
      );
    });

    this.modificationSub = this.modificationSubject.pipe(debounceTime(1500)).subscribe(() => this.enregistrerAuto());
  }

  onSelectionChange(): void {
    this.refresh();
  }

  onClasseChange(): void {
    this.mettreAJourMatieresDisponibles();
    if (this.matiereId && !this.matieresDisponibles.some((m) => m.id === this.matiereId)) {
      this.matiereId = null;
    }
    this.refresh();
  }

  private mettreAJourMatieresDisponibles(): void {
    const classe = this.classes.find((c) => c.id === this.classeId);
    this.matieresDisponibles =
      !classe?.matiereIds || classe.matiereIds.length === 0
        ? this.matieres
        : this.matieres.filter((m) => classe.matiereIds!.includes(m.id!));
  }

  onValeurModifiee(): void {
    this.autoSaveStatut = 'idle';
    this.modificationSubject.next();
  }

  private enregistrerAuto(): void {
    if (!this.feuille || this.etapeReadonly || !this.classeId || !this.matiereId || !this.periodeId) return;
    this.autoSaveStatut = 'saving';
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.autoSaveStatut = 'saved';
      },
      error: (err) => {
        this.autoSaveStatut = 'erreur';
        this.notification.error(err);
      }
    });
  }

  refresh(): void {
    if (!this.classeId || !this.matiereId || !this.periodeId) {
      this.feuille = null;
      this.progression = null;
      this.historique = [];
      return;
    }
    this.loading = true;
    this.noteService.getFeuille(this.classeId, this.matiereId, this.periodeId).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.loading = false;
      },
      error: () => {
        this.notification.error('Impossible de charger la feuille de notes');
        this.loading = false;
      }
    });
    this.chargerProgression();
    this.chargerHistorique();
  }

  private chargerProgression(): void {
    if (!this.classeId || !this.matiereId || !this.periodeId) return;
    this.noteService.getProgression(this.classeId, this.matiereId, this.periodeId).subscribe({
      next: (res: any) => (this.progression = res.data ?? res),
      error: () => (this.progression = null)
    });
  }

  private chargerHistorique(): void {
    if (!this.classeId || !this.matiereId || !this.periodeId) return;
    this.noteService.getHistorique(this.classeId, this.matiereId, this.periodeId).subscribe({
      next: (res: any) => (this.historique = res.data ?? res ?? []),
      error: () => (this.historique = [])
    });
  }

  private construirePayload(): any {
    return {
      classeId: this.classeId,
      matiereId: this.matiereId,
      periodeId: this.periodeId,
      eleves: this.feuille!.eleves.map((el) => ({
        eleveId: el.eleveId,
        interrogations: el.interrogations ?? [],
        devoir1: el.devoir1 ?? null,
        devoir2: el.devoir2 ?? null
      }))
    };
  }

  async enregistrer(): Promise<void> {
    if (!this.feuille || this.etapeReadonly || !this.classeId || !this.matiereId || !this.periodeId) return;

    const confirmed = await this.notification.confirm(
      'Voulez-vous enregistrer les notes saisies pour cette classe et cette matière ?',
      'Confirmation'
    );
    if (!confirmed) return;

    this.saving = true;
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.notification.success('Notes enregistrées');
        this.saving = false;
      },
      error: (err) => {
        this.notification.error(err);
        this.saving = false;
      }
    });
  }

  /** Colonnes reçues de l'enseignant et pas encore approuvées. */
  private colonnesAApprouver(): ColonneChoix[] {
    if (!this.feuille || !this.progression) return [];
    const p = this.progression;
    const cols: ColonneChoix[] = [];
    for (let n = (p.interrogationsValideesJusqua ?? 0) + 1; n <= (p.interrogationsVerroueesJusqua ?? 0); n++) {
      cols.push({ type: 'INTERROGATION', numero: n, libelle: `Interrogation ${n}`, choisie: false });
    }
    for (let n = (p.devoirsValideesJusqua ?? 0) + 1; n <= (p.devoirsVerrouesJusqua ?? 0); n++) {
      cols.push({ type: 'DEVOIR', numero: n, libelle: n === 1 ? '1er Devoir' : '2e Devoir', choisie: false });
    }
    return cols;
  }

  /** L'administration approuve une sélection de colonnes reçues. Les colonnes approuvées sont
      figées / grisées ; quand tout ce qui a été envoyé est approuvé, la matière passe « Approuvé ». */
  async approuver(): Promise<void> {
    if (!this.aApprouver || !this.classeId || !this.matiereId || !this.periodeId) return;

    const colonnes = this.colonnesAApprouver();
    if (colonnes.length === 0) {
      this.notification.info('Aucune colonne en attente d\'approbation.');
      return;
    }

    const choix: ChoixColonnesResultat | null = await this.dialog
      .open(ChoixColonnesDialogComponent, {
        width: '460px',
        maxWidth: '95vw',
        panelClass: 'professional-dialog',
        data: {
          titre: 'Approuver les notes',
          sousTitre: (this.feuille?.matiereLibelle ?? '') + ' · ' + (this.feuille?.classeLibelle ?? ''),
          intro:
            "Cochez les colonnes que vous approuvez. Une fois approuvées, elles sont figées ; " +
            "il faudra renvoyer la matière à l'enseignant pour les rouvrir.",
          cta: 'Approuver',
          colonnes
        }
      })
      .afterClosed()
      .toPromise();

    if (!choix) return;

    this.approbationEnCours = true;
    this.noteService
      .approuverColonnes({
        classeId: this.classeId,
        matiereId: this.matiereId,
        periodeId: this.periodeId,
        interrogationsJusqua: choix.interrogationsJusqua,
        devoirsJusqua: choix.devoirsJusqua
      })
      .subscribe({
        next: (res: any) => {
          this.progression = res.data ?? res;
          this.notification.success('Colonnes approuvées');
          this.approbationEnCours = false;
          this.chargerHistorique();
        },
        error: (err) => {
          this.notification.error(err);
          this.approbationEnCours = false;
        }
      });
  }

  /** Renvoie une matière (reçue ou approuvée) à l'enseignant pour qu'il la corrige / la complète. */
  async renvoyerALEnseignant(): Promise<void> {
    if (!this.classeId || !this.matiereId || !this.periodeId) return;
    if (this.progression?.etape !== 'SOUMISE' && this.progression?.etape !== 'VALIDEE') return;
    const confirmed = await this.notification.confirm(
      "Renvoyer cette matière à l'enseignant ? Il récupère la main (corriger, ajouter une " +
        'interrogation…) et devra la renvoyer ensuite.',
      "Renvoyer à l'enseignant"
    );
    if (!confirmed) return;
    this.approbationEnCours = true;
    this.noteService
      .renvoyerAuProfesseur({ classeId: this.classeId, matiereId: this.matiereId, periodeId: this.periodeId })
      .subscribe({
        next: (res: any) => {
          this.progression = res.data ?? res;
          this.notification.success("Matière renvoyée à l'enseignant");
          this.approbationEnCours = false;
          this.refresh();
        },
        error: (err) => {
          this.notification.error(err);
          this.approbationEnCours = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.modificationSub?.unsubscribe();
    if (!this.feuille || this.feuille.valide || this.etapeReadonly || !this.classeId || !this.matiereId || !this.periodeId) return;
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe();
  }
}
