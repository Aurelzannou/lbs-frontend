import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { NoteService } from '../../../core/services/note.service';
import { NotificationService } from '../../../core/services/notification.service';
import { FeuilleSaisieNotes } from '../../../core/models/note.model';
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
  imports: [CommonModule, MatDialogModule, MatIconModule, NotesRosterTableComponent],
  templateUrl: './matiere-notes-dialog.component.html',
  styleUrl: './matiere-notes-dialog.component.scss'
})
export class MatiereNotesDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<MatiereNotesDialogComponent>);
  public data = inject<MatiereNotesDialogData>(MAT_DIALOG_DATA);
  private noteService = inject(NoteService);
  private notification = inject(NotificationService);

  feuille: FeuilleSaisieNotes | null = null;
  loading = false;
  saving = false;
  modifie = false;

  ngOnInit(): void {
    this.refresh();
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
