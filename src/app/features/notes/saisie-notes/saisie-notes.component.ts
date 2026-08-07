import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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

@Component({
  selector: 'app-saisie-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, NgSelectModule, NotesRosterTableComponent],
  templateUrl: './saisie-notes.component.html',
  styleUrl: './saisie-notes.component.scss'
})
export class SaisieNotesComponent implements OnInit, OnDestroy {
  private noteService = inject(NoteService);
  private classeService = inject(ClasseService);
  private matiereService = inject(MatiereService);
  private periodeService = inject(PeriodeAcademiqueService);
  private notification = inject(NotificationService);

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
  deverrouillageEnCours = false;
  validationEnCours = false;

  autoSaveStatut: 'idle' | 'saving' | 'saved' | 'erreur' = 'idle';
  private modificationSubject = new Subject<void>();
  private modificationSub?: Subscription;

  get etapeReadonly(): boolean {
    return this.progression?.etape === 'VALIDEE';
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
    // Cet écran de saisie directe se limite à l'année scolaire active — la consultation/modification
    // des périodes d'une année inactive reste possible, mais uniquement depuis l'écran "Validation
    // des bulletins" (qui garde volontairement un accès à tout l'historique).
    this.periodeService.getAll(1, 50).subscribe((res: any) => {
      const toutes = res.data ?? (Array.isArray(res) ? res : []);
      this.periodes = toutes.filter((p: PeriodeAcademique) => !!p.anneeScolaire?.actif);
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

  async validerInterrogation(): Promise<void> {
    if (!this.progression) return;
    const numero = this.progression.interrogationsValideesJusqua + 1;
    if (numero > this.progression.interrogationsVerroueesJusqua) return;
    const confirmed = await this.notification.confirm(
      `Valider l'interrogation ${numero} ? Le professeur pourra alors verrouiller la colonne suivante.`,
      'Valider cette colonne'
    );
    if (!confirmed) return;
    this.validerColonne('INTERROGATION', numero);
  }

  async validerDevoir(): Promise<void> {
    if (!this.progression) return;
    const numero = this.progression.devoirsValideesJusqua + 1;
    if (numero > this.progression.devoirsVerrouesJusqua) return;
    const label = numero === 1 ? 'le 1er devoir' : 'le 2e devoir';
    const confirmed = await this.notification.confirm(`Valider ${label} ?`, 'Valider cette colonne');
    if (!confirmed) return;
    this.validerColonne('DEVOIR', numero);
  }

  private validerColonne(typeEvaluation: 'INTERROGATION' | 'DEVOIR', numero: number): void {
    if (!this.classeId || !this.matiereId || !this.periodeId) return;
    this.deverrouillageEnCours = true;
    this.noteService
      .validerColonne({ classeId: this.classeId, matiereId: this.matiereId, periodeId: this.periodeId, typeEvaluation, numero })
      .subscribe({
        next: (res: any) => {
          this.progression = res.data ?? res;
          this.notification.success('Colonne validée');
          this.deverrouillageEnCours = false;
        },
        error: (err) => {
          this.notification.error(err);
          this.deverrouillageEnCours = false;
        }
      });
  }

  async deverrouillerInterrogations(): Promise<void> {
    if (!this.progression || this.progression.interrogationsVerroueesJusqua === 0) return;
    const confirmed = await this.notification.confirm(
      `Déverrouiller l'interrogation ${this.progression.interrogationsVerroueesJusqua} ? Le professeur pourra de nouveau la modifier.`,
      'Déverrouiller cette colonne'
    );
    if (!confirmed) return;
    this.deverrouiller('INTERROGATION', this.progression.interrogationsVerroueesJusqua);
  }

  async deverrouillerDevoirs(): Promise<void> {
    if (!this.progression || this.progression.devoirsVerrouesJusqua === 0) return;
    const numero = this.progression.devoirsVerrouesJusqua;
    const label = numero === 1 ? 'le 1er devoir' : 'le 2e devoir';
    const confirmed = await this.notification.confirm(
      `Déverrouiller ${label} ? Le professeur pourra de nouveau le modifier.`,
      'Déverrouiller cette colonne'
    );
    if (!confirmed) return;
    this.deverrouiller('DEVOIR', numero);
  }

  private deverrouiller(typeEvaluation: 'INTERROGATION' | 'DEVOIR', numero: number): void {
    if (!this.classeId || !this.matiereId || !this.periodeId) return;
    this.deverrouillageEnCours = true;
    this.noteService
      .deverrouillerColonne({ classeId: this.classeId, matiereId: this.matiereId, periodeId: this.periodeId, typeEvaluation, numero })
      .subscribe({
        next: (res: any) => {
          this.progression = res.data ?? res;
          this.notification.success('Colonne déverrouillée');
          this.deverrouillageEnCours = false;
        },
        error: (err) => {
          this.notification.error(err);
          this.deverrouillageEnCours = false;
        }
      });
  }

  async validerMatiere(): Promise<void> {
    if (!this.progression || this.progression.etape !== 'SOUMISE' || !this.classeId || !this.matiereId || !this.periodeId) return;
    const confirmed = await this.notification.confirm(
      'Valider cette matière ? Plus personne (y compris vous) ne pourra modifier les notes tant que vous ne dévaliderez pas.',
      'Valider cette matière'
    );
    if (!confirmed) return;
    this.validationEnCours = true;
    this.noteService.validerMatiere({ classeId: this.classeId, matiereId: this.matiereId, periodeId: this.periodeId }).subscribe({
      next: (res: any) => {
        this.progression = res.data ?? res;
        this.notification.success('Matière validée');
        this.validationEnCours = false;
        this.chargerHistorique();
      },
      error: (err) => {
        this.notification.error(err);
        this.validationEnCours = false;
      }
    });
  }

  async devaliderMatiere(): Promise<void> {
    if (!this.progression || this.progression.etape !== 'VALIDEE' || !this.classeId || !this.matiereId || !this.periodeId) return;
    const confirmed = await this.notification.confirm(
      'Annuler la validation de cette matière ? La saisie redeviendra modifiable (par vous, pas par le professeur sans nouvelle soumission).',
      'Dévalider cette matière'
    );
    if (!confirmed) return;
    this.validationEnCours = true;
    this.noteService.devaliderMatiere({ classeId: this.classeId, matiereId: this.matiereId, periodeId: this.periodeId }).subscribe({
      next: (res: any) => {
        this.progression = res.data ?? res;
        this.notification.success('Validation annulée');
        this.validationEnCours = false;
        this.chargerHistorique();
      },
      error: (err) => {
        this.notification.error(err);
        this.validationEnCours = false;
      }
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

  ngOnDestroy(): void {
    this.modificationSub?.unsubscribe();
    if (!this.feuille || this.feuille.valide || this.etapeReadonly || !this.classeId || !this.matiereId || !this.periodeId) return;
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe();
  }
}
