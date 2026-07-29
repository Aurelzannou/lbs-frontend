import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';
import { NoteService } from '../../../core/services/note.service';
import { PeriodeAcademiqueService } from '../../../core/services/periode-academique.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PeriodeAcademique } from '../../../core/models/periode-academique.model';
import { FeuilleSaisieNotes } from '../../../core/models/note.model';
import { NotesRosterTableComponent } from '../../notes/notes-roster-table/notes-roster-table.component';

@Component({
  selector: 'app-professeur-saisie',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    NgSelectModule,
    NotesRosterTableComponent
  ],
  templateUrl: './saisie.component.html',
  styleUrl: './saisie.component.scss'
})
export class ProfesseurSaisieComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private noteService = inject(NoteService);
  private periodeService = inject(PeriodeAcademiqueService);
  private notification = inject(NotificationService);

  classeId!: number;
  matiereId!: number;
  periodes: PeriodeAcademique[] = [];
  periodeId: number | null = null;

  feuille: FeuilleSaisieNotes | null = null;
  loading = false;
  saving = false;

  ngOnInit(): void {
    this.classeId = Number(this.route.snapshot.queryParamMap.get('classeId'));
    this.matiereId = Number(this.route.snapshot.queryParamMap.get('matiereId'));

    if (!this.classeId || !this.matiereId) {
      this.router.navigate(['/professeur/dashboard']);
      return;
    }

    this.periodeService.getAll(1, 50).subscribe((res: any) => {
      this.periodes = res.data ?? (Array.isArray(res) ? res : []);
    });
  }

  onPeriodeChange(): void {
    this.refresh();
  }

  refresh(): void {
    if (!this.periodeId) {
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
    if (!this.feuille || !this.periodeId) return;

    const confirmed = await this.notification.confirm(
      'Voulez-vous enregistrer les notes saisies pour cette classe ?',
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

  retour(): void {
    this.router.navigate(['/professeur/dashboard']);
  }
}
