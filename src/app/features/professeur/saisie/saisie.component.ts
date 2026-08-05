import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NoteService } from '../../../core/services/note.service';
import { PeriodeAcademiqueService } from '../../../core/services/periode-academique.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PeriodeAcademique } from '../../../core/models/periode-academique.model';
import { FeuilleSaisieNotes, ProgressionSaisieNotes } from '../../../core/models/note.model';
import { NotesRosterTableComponent } from '../../notes/notes-roster-table/notes-roster-table.component';

@Component({
  selector: 'app-professeur-saisie',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    NotesRosterTableComponent
  ],
  templateUrl: './saisie.component.html',
  styleUrl: './saisie.component.scss'
})
export class ProfesseurSaisieComponent implements OnInit, OnDestroy {
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
  progression: ProgressionSaisieNotes | null = null;
  loading = false;
  saving = false;
  verrouillageEnCours = false;
  soumission = false;

  get peutSoumettre(): boolean {
    return !!this.progression
      && this.progression.etape === 'BROUILLON'
      && this.progression.interrogationsVerroueesJusqua >= 1
      && this.progression.devoirsVerrouesJusqua >= 2;
  }

  get etapeReadonly(): boolean {
    return !!this.progression && this.progression.etape !== 'BROUILLON';
  }

  ngOnInit(): void {
    this.classeId = Number(this.route.snapshot.queryParamMap.get('classeId'));
    this.matiereId = Number(this.route.snapshot.queryParamMap.get('matiereId'));

    if (!this.classeId || !this.matiereId) {
      this.router.navigate(['/professeur/dashboard']);
      return;
    }

    // Le professeur ne peut saisir que la période en cours (l'admin, lui, garde accès à
    // toutes les périodes depuis son propre écran).
    this.periodeService.getAll(1, 50).subscribe((res: any) => {
      const toutes = res.data ?? (Array.isArray(res) ? res : []);
      this.periodes = toutes.filter((p: PeriodeAcademique) => p.statut === 'EN_COURS');
      if (this.periodes.length === 1) {
        this.periodeId = this.periodes[0].id!;
        this.refresh();
      }
    });
  }

  refresh(): void {
    if (!this.periodeId) {
      this.feuille = null;
      this.progression = null;
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
  }

  private chargerProgression(): void {
    if (!this.periodeId) return;
    this.noteService.getProgression(this.classeId, this.matiereId, this.periodeId).subscribe({
      next: (res: any) => (this.progression = res.data ?? res),
      error: () => (this.progression = null)
    });
  }

  async verrouillerInterrogation(numero: number): Promise<void> {
    const confirmed = await this.notification.confirm(
      `Verrouiller l'interrogation ${numero} ? Vous ne pourrez plus la modifier ensuite (seul un admin pourra la déverrouiller).`,
      'Verrouiller cette colonne'
    );
    if (!confirmed) return;
    this.verrouillerColonne('INTERROGATION', numero);
  }

  async verrouillerDevoir(numero: number): Promise<void> {
    const label = numero === 1 ? 'le 1er devoir' : 'le 2e devoir';
    const confirmed = await this.notification.confirm(
      `Verrouiller ${label} ? Vous ne pourrez plus le modifier ensuite (seul un admin pourra le déverrouiller).`,
      'Verrouiller cette colonne'
    );
    if (!confirmed) return;
    this.verrouillerColonne('DEVOIR', numero);
  }

  private verrouillerColonne(typeEvaluation: 'INTERROGATION' | 'DEVOIR', numero: number): void {
    if (!this.feuille || !this.periodeId) return;
    this.verrouillageEnCours = true;
    // On enregistre d'abord les valeurs en cours (l'utilisateur peut avoir modifié cette colonne
    // juste avant de cliquer "Terminer") pour ne jamais verrouiller des données non sauvegardées.
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.noteService
          .verrouillerColonne({ classeId: this.classeId, matiereId: this.matiereId, periodeId: this.periodeId!, typeEvaluation, numero })
          .subscribe({
            next: (prog: any) => {
              this.progression = prog.data ?? prog;
              this.notification.success('Colonne verrouillée');
              this.verrouillageEnCours = false;
            },
            error: (err) => {
              this.notification.error(err);
              this.verrouillageEnCours = false;
            }
          });
      },
      error: (err) => {
        this.notification.error(err);
        this.verrouillageEnCours = false;
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
    if (!this.feuille || !this.periodeId) return;

    const confirmed = await this.notification.confirm(
      'Voulez-vous enregistrer les notes saisies pour cette classe ?',
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

  async soumettre(): Promise<void> {
    if (!this.periodeId || !this.peutSoumettre) return;
    const confirmed = await this.notification.confirm(
      "Soumettre cette matière pour validation ? Vous ne pourrez plus modifier les notes tant que l'administration n'aura pas répondu.",
      'Soumettre pour validation'
    );
    if (!confirmed) return;
    this.soumission = true;
    this.noteService
      .soumettreMatiere({ classeId: this.classeId, matiereId: this.matiereId, periodeId: this.periodeId })
      .subscribe({
        next: (res: any) => {
          this.progression = res.data ?? res;
          this.notification.success('Matière soumise pour validation');
          this.soumission = false;
        },
        error: (err) => {
          this.notification.error(err);
          this.soumission = false;
        }
      });
  }

  retour(): void {
    this.router.navigate(['/professeur/dashboard']);
  }

  ngOnDestroy(): void {
    if (!this.feuille || this.feuille.valide || !this.periodeId) return;
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe();
  }
}
