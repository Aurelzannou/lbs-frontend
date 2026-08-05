import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NoteService } from '../../../core/services/note.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FeuilleSaisieNotes, ProgressionEtapeHistorique, ProgressionSaisieNotes } from '../../../core/models/note.model';
import { NotesRosterTableComponent } from '../notes-roster-table/notes-roster-table.component';

export interface MatiereNotesDialogData {
  classeId: number;
  matiereId: number;
  periodeId: number;
  classeLibelle: string;
  matiereLibelle: string;
  periodeLibelle: string;
  readonly: boolean;
}

@Component({
  selector: 'app-matiere-notes-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatTooltipModule, NotesRosterTableComponent],
  templateUrl: './matiere-notes-dialog.component.html',
  styleUrl: './matiere-notes-dialog.component.scss'
})
export class MatiereNotesDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(MatDialogRef<MatiereNotesDialogComponent>);
  public data = inject<MatiereNotesDialogData>(MAT_DIALOG_DATA);
  private noteService = inject(NoteService);
  private notification = inject(NotificationService);

  feuille: FeuilleSaisieNotes | null = null;
  progression: ProgressionSaisieNotes | null = null;
  loading = false;
  saving = false;
  modifie = false;
  deverrouillageEnCours = false;
  validationEnCours = false;
  historique: ProgressionEtapeHistorique[] = [];
  afficherHistorique = false;

  autoSaveStatut: 'idle' | 'saving' | 'saved' | 'erreur' = 'idle';
  private modificationSubject = new Subject<void>();
  private modificationSub?: Subscription;

  get etapeReadonly(): boolean {
    return this.progression?.etape === 'VALIDEE';
  }

  ngOnInit(): void {
    this.refresh();
    this.chargerProgression();
    this.chargerHistorique();
    this.modificationSub = this.modificationSubject.pipe(debounceTime(1500)).subscribe(() => this.enregistrerAuto());
  }

  ngOnDestroy(): void {
    this.modificationSub?.unsubscribe();
    if (!this.feuille || this.data.readonly || this.etapeReadonly) return;
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe();
  }

  onValeurModifiee(): void {
    this.autoSaveStatut = 'idle';
    this.modificationSubject.next();
  }

  private construirePayload(): any {
    return {
      classeId: this.data.classeId,
      matiereId: this.data.matiereId,
      periodeId: this.data.periodeId,
      contexteValidation: true,
      eleves: this.feuille!.eleves.map((el) => ({
        eleveId: el.eleveId,
        interrogations: el.interrogations ?? [],
        devoir1: el.devoir1 ?? null,
        devoir2: el.devoir2 ?? null
      }))
    };
  }

  private enregistrerAuto(): void {
    if (!this.feuille || this.data.readonly || this.etapeReadonly) return;
    this.autoSaveStatut = 'saving';
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.modifie = true;
        this.autoSaveStatut = 'saved';
      },
      error: (err) => {
        this.autoSaveStatut = 'erreur';
        this.notification.error(err);
      }
    });
  }

  private chargerHistorique(): void {
    this.noteService.getHistorique(this.data.classeId, this.data.matiereId, this.data.periodeId).subscribe({
      next: (res: any) => (this.historique = res.data ?? res ?? []),
      error: () => (this.historique = [])
    });
  }

  private chargerProgression(): void {
    this.noteService.getProgression(this.data.classeId, this.data.matiereId, this.data.periodeId).subscribe({
      next: (res: any) => (this.progression = res.data ?? res),
      error: () => (this.progression = null)
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
    this.deverrouillageEnCours = true;
    this.noteService
      .deverrouillerColonne({
        classeId: this.data.classeId,
        matiereId: this.data.matiereId,
        periodeId: this.data.periodeId,
        typeEvaluation,
        numero
      })
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
    const confirmed = await this.notification.confirm(
      `Valider ${label} ?`,
      'Valider cette colonne'
    );
    if (!confirmed) return;
    this.validerColonne('DEVOIR', numero);
  }

  private validerColonne(typeEvaluation: 'INTERROGATION' | 'DEVOIR', numero: number): void {
    this.deverrouillageEnCours = true;
    this.noteService
      .validerColonne({ classeId: this.data.classeId, matiereId: this.data.matiereId, periodeId: this.data.periodeId, typeEvaluation, numero })
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

  async validerMatiere(): Promise<void> {
    if (!this.progression || this.progression.etape !== 'SOUMISE') return;
    const confirmed = await this.notification.confirm(
      'Valider cette matière ? Plus personne (y compris vous) ne pourra modifier les notes tant que vous ne dévaliderez pas.',
      'Valider cette matière'
    );
    if (!confirmed) return;
    this.validationEnCours = true;
    this.noteService
      .validerMatiere({ classeId: this.data.classeId, matiereId: this.data.matiereId, periodeId: this.data.periodeId })
      .subscribe({
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
    if (!this.progression || this.progression.etape !== 'VALIDEE') return;
    const confirmed = await this.notification.confirm(
      'Annuler la validation de cette matière ? La saisie redeviendra modifiable (par vous, pas par le professeur sans nouvelle soumission).',
      'Dévalider cette matière'
    );
    if (!confirmed) return;
    this.validationEnCours = true;
    this.noteService
      .devaliderMatiere({ classeId: this.data.classeId, matiereId: this.data.matiereId, periodeId: this.data.periodeId })
      .subscribe({
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

  refresh(): void {
    this.loading = true;
    this.noteService.getFeuille(this.data.classeId, this.data.matiereId, this.data.periodeId).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.loading = false;
      },
      error: () => {
        this.notification.error('Impossible de charger les notes');
        this.loading = false;
      }
    });
  }

  enregistrer(): void {
    if (!this.feuille) return;
    this.saving = true;
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.modifie = true;
        this.notification.success('Notes enregistrées');
        this.saving = false;
      },
      error: (err) => {
        this.notification.error(err);
        this.saving = false;
      }
    });
  }

  fermer(): void {
    this.dialogRef.close(this.modifie);
  }
}
