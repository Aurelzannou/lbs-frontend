import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NgSelectModule } from '@ng-select/ng-select';
import { NoteService } from '../../../core/services/note.service';
import { ClasseService } from '../../../core/services/classe.service';
import { MatiereService } from '../../../core/services/matiere.service';
import { PeriodeAcademiqueService } from '../../../core/services/periode-academique.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Classe } from '../../../core/models/classe.model';
import { Matiere } from '../../../core/models/matiere.model';
import { PeriodeAcademique } from '../../../core/models/periode-academique.model';
import { FeuilleSaisieNotes } from '../../../core/models/note.model';
import { NotesRosterTableComponent } from '../notes-roster-table/notes-roster-table.component';

@Component({
  selector: 'app-saisie-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, NgSelectModule, NotesRosterTableComponent],
  templateUrl: './saisie-notes.component.html',
  styleUrl: './saisie-notes.component.scss'
})
export class SaisieNotesComponent implements OnInit {
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

  feuille: FeuilleSaisieNotes | null = null;
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.classeService.getAll(1, 100).subscribe((res: any) => {
      this.classes = res.data ?? (Array.isArray(res) ? res : []);
    });
    this.matiereService.getAll(1, 100).subscribe((res: any) => {
      this.matieres = res.data ?? (Array.isArray(res) ? res : []);
    });
    this.periodeService.getAll(1, 50).subscribe((res: any) => {
      this.periodes = res.data ?? (Array.isArray(res) ? res : []);
    });
  }

  onSelectionChange(): void {
    this.refresh();
  }

  refresh(): void {
    if (!this.classeId || !this.matiereId || !this.periodeId) {
      this.feuille = null;
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
  }

  async enregistrer(): Promise<void> {
    if (!this.feuille || !this.classeId || !this.matiereId || !this.periodeId) return;

    const confirmed = await this.notification.confirm(
      'Voulez-vous enregistrer les notes saisies pour cette classe et cette matière ?',
      'Confirmation'
    );
    if (!confirmed) return;

    this.saving = true;
    const payload = {
      classeId: this.classeId,
      matiereId: this.matiereId,
      periodeId: this.periodeId,
      eleves: this.feuille.eleves.map((el) => ({
        eleveId: el.eleveId,
        interrogation: el.interrogation ?? null,
        devoir1: el.devoir1 ?? null,
        devoir2: el.devoir2 ?? null
      }))
    };

    this.noteService.enregistrerFeuille(payload).subscribe({
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
}
