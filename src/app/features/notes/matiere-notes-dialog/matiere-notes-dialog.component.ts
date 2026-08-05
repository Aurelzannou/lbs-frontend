import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoteService } from '../../../core/services/note.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FeuilleSaisieNotes, ProgressionSaisieNotes } from '../../../core/models/note.model';
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
export class MatiereNotesDialogComponent implements OnInit {
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

  get etapeReadonly(): boolean {
    return this.progression?.etape === 'VALIDEE';
  }

  ngOnInit(): void {
    this.refresh();
    this.chargerProgression();
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
    const payload = {
      classeId: this.data.classeId,
      matiereId: this.data.matiereId,
      periodeId: this.data.periodeId,
      eleves: this.feuille.eleves.map((el) => ({
        eleveId: el.eleveId,
        interrogations: el.interrogations ?? [],
        devoir1: el.devoir1 ?? null,
        devoir2: el.devoir2 ?? null
      }))
    };
    this.noteService.enregistrerFeuille(payload).subscribe({
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
