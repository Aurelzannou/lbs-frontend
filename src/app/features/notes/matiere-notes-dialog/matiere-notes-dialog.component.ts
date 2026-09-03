import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NoteService } from '../../../core/services/note.service';
import { ValidationBulletinService } from '../../../core/services/validation-bulletin.service';
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
  private validationBulletinService = inject(ValidationBulletinService);
  private notification = inject(NotificationService);

  feuille: FeuilleSaisieNotes | null = null;
  progression: ProgressionSaisieNotes | null = null;
  loading = false;
  saving = false;
  renvoiEnCours = false;
  modifie = false;
  historique: ProgressionEtapeHistorique[] = [];
  afficherHistorique = false;

  autoSaveStatut: 'idle' | 'saving' | 'saved' | 'erreur' = 'idle';
  private modificationSubject = new Subject<void>();
  private modificationSub?: Subscription;

  get etapeLabel(): string {
    switch (this.progression?.etape) {
      case 'VALIDEE':
        return 'Validé';
      case 'SOUMISE':
        return "Reçu de l'enseignant";
      default:
        return this.feuille?.professeurAssigne ? 'En cours de saisie (enseignant)' : 'Brouillon';
    }
  }

  ngOnInit(): void {
    this.refresh();
    this.chargerProgression();
    this.chargerHistorique();
    this.modificationSub = this.modificationSubject.pipe(debounceTime(1500)).subscribe(() => this.enregistrerAuto());
  }

  ngOnDestroy(): void {
    this.modificationSub?.unsubscribe();
    if (!this.feuille || this.data.readonly) return;
    this.validationBulletinService.corrigerNotes(this.construirePayload()).subscribe();
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
      eleves: this.feuille!.eleves.map((el) => ({
        eleveId: el.eleveId,
        interrogations: el.interrogations ?? [],
        devoir1: el.devoir1 ?? null,
        devoir2: el.devoir2 ?? null
      }))
    };
  }

  private enregistrerAuto(): void {
    if (!this.feuille || this.data.readonly) return;
    this.autoSaveStatut = 'saving';
    this.validationBulletinService.corrigerNotes(this.construirePayload()).subscribe({
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
    this.validationBulletinService.corrigerNotes(this.construirePayload()).subscribe({
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

  get peutRenvoyer(): boolean {
    return !this.data.readonly && this.progression?.etape === 'SOUMISE';
  }

  async renvoyerAuProfesseur(): Promise<void> {
    if (!this.peutRenvoyer) return;
    const confirmed = await this.notification.confirm(
      `Renvoyer « ${this.data.matiereLibelle} » à l'enseignant ? Il pourra de nouveau modifier et ` +
        `ajouter des interrogations, puis vous la renverra.`,
      "Renvoyer à l'enseignant"
    );
    if (!confirmed) return;
    this.renvoiEnCours = true;
    this.noteService
      .renvoyerAuProfesseur({ classeId: this.data.classeId, matiereId: this.data.matiereId, periodeId: this.data.periodeId })
      .subscribe({
        next: (res: any) => {
          this.progression = res.data ?? res;
          this.modifie = true;
          this.renvoiEnCours = false;
          this.notification.success("Matière renvoyée à l'enseignant");
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.notification.error(err);
          this.renvoiEnCours = false;
        }
      });
  }

  fermer(): void {
    this.dialogRef.close(this.modifie);
  }
}
