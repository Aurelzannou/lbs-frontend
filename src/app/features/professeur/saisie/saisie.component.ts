import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { NoteService } from '../../../core/services/note.service';
import { PeriodeAcademiqueService } from '../../../core/services/periode-academique.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PeriodeAcademique } from '../../../core/models/periode-academique.model';
import { FeuilleSaisieNotes, ProgressionSaisieNotes } from '../../../core/models/note.model';
import { NotesRosterTableComponent } from '../../notes/notes-roster-table/notes-roster-table.component';
import {
  ChoixColonnesDialogComponent,
  ColonneChoix,
  ChoixColonnesResultat
} from '../../notes/choix-colonnes-dialog.component';

@Component({
  selector: 'app-professeur-saisie',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
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
  private dialog = inject(MatDialog);

  classeId!: number;
  matiereId!: number;
  periodes: PeriodeAcademique[] = [];
  periodeId: number | null = null;

  feuille: FeuilleSaisieNotes | null = null;
  progression: ProgressionSaisieNotes | null = null;
  loading = false;
  saving = false;
  soumission = false;

  // Auto-save : après une coupure d'inactivité de saisie, on enregistre automatiquement en
  // silence — pour ne jamais perdre de notes en cas de coupure de courant avant que
  // l'utilisateur ne pense à cliquer "Enregistrer".
  autoSaveStatut: 'idle' | 'saving' | 'saved' | 'erreur' = 'idle';
  private modificationSubject = new Subject<void>();
  private modificationSub?: Subscription;

  /** Scénario simplifié : l'enseignant garde la main tant que l'administration n'a pas VALIDÉ.
      Une matière déjà envoyée reste modifiable — toute modification annule l'envoi (côté serveur,
      elle repasse en brouillon) et il faudra la renvoyer. */
  get etapeReadonly(): boolean {
    return !!this.feuille?.valide || this.progression?.etape === 'VALIDEE';
  }

  get envoyee(): boolean {
    return this.progression?.etape === 'SOUMISE';
  }

  get peutEnvoyer(): boolean {
    return !this.etapeReadonly && !!this.feuille && !this.feuille.valide
      && this.colonnesEnvoyables().length > 0;
  }

  get dateEnvoi(): string | null {
    return this.progression?.dateSoumission ?? null;
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
      // Le statut EN_COURS n'est calculé que sur les dates de la période — si l'admin a désactivé
      // l'année scolaire (fin d'année, erreur, etc.), la période ne doit plus être proposée même
      // si elle tombe encore dans son intervalle de dates.
      this.periodes = toutes.filter(
        (p: PeriodeAcademique) => p.statut === 'EN_COURS' && !!p.anneeScolaire?.actif
      );
      if (this.periodes.length === 1) {
        this.periodeId = this.periodes[0].id!;
        this.refresh();
      }
    });

    this.modificationSub = this.modificationSubject.pipe(debounceTime(1500)).subscribe(() => this.enregistrerAuto());
  }

  /** Vrai dès qu'une note a été touchée et pas encore enregistrée — évite un enregistrement inutile
      à la fermeture de la page (qui, sur une matière envoyée, annulerait l'envoi pour rien). */
  private dirty = false;

  onValeurModifiee(): void {
    this.dirty = true;
    this.autoSaveStatut = 'idle';
    this.modificationSubject.next();
  }

  private enregistrerAuto(): void {
    if (!this.feuille || this.feuille.valide || this.etapeReadonly || !this.periodeId) return;
    const etaitEnvoyee = this.envoyee;
    this.autoSaveStatut = 'saving';
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.dirty = false;
        this.autoSaveStatut = 'saved';
        // Modifier une matière envoyée annule l'envoi côté serveur : on rafraîchit l'étape.
        if (etaitEnvoyee) this.chargerProgression();
      },
      error: (err) => {
        this.autoSaveStatut = 'erreur';
        this.notification.error(err);
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

    const etaitEnvoyee = this.envoyee;
    this.saving = true;
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.dirty = false;
        if (etaitEnvoyee) this.chargerProgression();
        this.notification.success('Notes enregistrées');
        this.saving = false;
      },
      error: (err) => {
        this.notification.error(err);
        this.saving = false;
      }
    });
  }

  /** Colonnes remplies et pas encore envoyées — proposées à l'enseignant dans le dialogue d'envoi. */
  private colonnesEnvoyables(): ColonneChoix[] {
    if (!this.feuille) return [];
    const dejaInterro = this.progression?.interrogationsVerroueesJusqua ?? 0;
    const dejaDevoir = this.progression?.devoirsVerrouesJusqua ?? 0;
    const cols: ColonneChoix[] = [];

    for (let n = dejaInterro + 1; n <= this.feuille.nombreInterrogations; n++) {
      if (this.feuille.eleves.some((e) => e.interrogations?.[n - 1] != null)) {
        cols.push({ type: 'INTERROGATION', numero: n, libelle: `Interrogation ${n}`, choisie: false });
      }
    }
    for (const n of [1, 2]) {
      if (n <= dejaDevoir) continue;
      const rempli = this.feuille.eleves.some((e) => (n === 1 ? e.devoir1 : e.devoir2) != null);
      if (rempli) {
        cols.push({ type: 'DEVOIR', numero: n, libelle: n === 1 ? '1er Devoir' : '2e Devoir', choisie: false });
      }
    }
    return cols;
  }

  async envoyerAAdministration(): Promise<void> {
    if (!this.periodeId || !this.peutEnvoyer) return;

    const colonnes = this.colonnesEnvoyables();
    if (colonnes.length === 0) {
      this.notification.info('Aucune nouvelle colonne remplie à envoyer.');
      return;
    }

    const choix: ChoixColonnesResultat | null = await this.dialog
      .open(ChoixColonnesDialogComponent, {
        width: '460px',
        maxWidth: '95vw',
        panelClass: 'professional-dialog',
        data: {
          titre: "Envoyer à l'administration",
          sousTitre: (this.feuille?.matiereLibelle ?? '') + ' · ' + (this.feuille?.classeLibelle ?? ''),
          intro:
            'Cochez les colonnes à envoyer. Une fois envoyées, elles sont figées : vous ne pourrez ' +
            "plus les modifier sans un renvoi de l'administration.",
          cta: 'Envoyer',
          colonnes
        }
      })
      .afterClosed()
      .toPromise();

    if (!choix) return;

    this.soumission = true;
    // On enregistre d'abord la dernière saisie en cours, puis on envoie la sélection.
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe({
      next: () => {
        this.noteService
          .soumettreMatiere({
            classeId: this.classeId,
            matiereId: this.matiereId,
            periodeId: this.periodeId!,
            interrogationsJusqua: choix.interrogationsJusqua,
            devoirsJusqua: choix.devoirsJusqua
          })
          .subscribe({
            next: (res: any) => {
              this.progression = res.data ?? res;
              this.refresh();
              this.notification.success("Colonnes envoyées à l'administration");
              this.soumission = false;
            },
            error: (err) => {
              this.notification.error(err);
              this.soumission = false;
            }
          });
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
    this.modificationSub?.unsubscribe();
    // N'enregistrer à la fermeture QUE s'il reste des modifications non sauvegardées — sinon on
    // annulerait inutilement l'envoi d'une matière simplement consultée.
    if (!this.dirty || !this.feuille || this.feuille.valide || this.etapeReadonly || !this.periodeId) return;
    this.noteService.enregistrerFeuille(this.construirePayload()).subscribe();
  }
}
