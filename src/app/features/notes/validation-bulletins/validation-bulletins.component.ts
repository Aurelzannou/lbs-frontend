import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgSelectModule } from '@ng-select/ng-select';
import { PeriodeAcademiqueService } from '../../../core/services/periode-academique.service';
import { ValidationBulletinService } from '../../../core/services/validation-bulletin.service';
import { BulletinService } from '../../../core/services/bulletin.service';
import { NoteService } from '../../../core/services/note.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PeriodeAcademique } from '../../../core/models/periode-academique.model';
import { ValidationBulletin } from '../../../core/models/validation-bulletin.model';
import { Bulletin } from '../../../core/models/bulletin.model';
import { EtapeSaisieNotes } from '../../../core/models/note.model';
import { MatiereNotesDialogComponent } from '../matiere-notes-dialog/matiere-notes-dialog.component';
import { PdfPreviewDialogComponent } from '../pdf-preview-dialog/pdf-preview-dialog.component';

@Component({
  selector: 'app-validation-bulletins',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    NgSelectModule
  ],
  templateUrl: './validation-bulletins.component.html',
  styleUrl: './validation-bulletins.component.scss'
})
export class ValidationBulletinsComponent implements OnInit {
  private periodeService = inject(PeriodeAcademiqueService);
  private validationBulletinService = inject(ValidationBulletinService);
  private bulletinService = inject(BulletinService);
  private noteService = inject(NoteService);
  private notification = inject(NotificationService);
  private dialog = inject(MatDialog);

  periodes: PeriodeAcademique[] = [];
  periodeId: number | null = null;
  liste: ValidationBulletin[] = [];
  loading = false;
  telechargementEnCours: number | null = null;

  // Vue détaillée d'une classe (grille élèves × matières)
  classeSelectionnee: ValidationBulletin | null = null;
  bulletins: Bulletin[] = [];
  matieres: { id: number; libelle: string }[] = [];
  loadingDetail = false;
  telechargementEleveEnCours: number | null = null;

  /** Étape (BROUILLON/SOUMISE/VALIDEE) de chaque matière de la classe pour la période ouverte —
      tant qu'une matière est en BROUILLON (le professeur n'a pas soumis), l'admin ne peut pas
      l'ouvrir pour la modifier depuis cet écran de validation. */
  etapeParMatiere = new Map<number, EtapeSaisieNotes>();

  ngOnInit(): void {
    this.periodeService.getAll(1, 50).subscribe((res: any) => {
      this.periodes = res.data ?? (Array.isArray(res) ? res : []);
    });
  }

  get periodeSelectionnee(): PeriodeAcademique | undefined {
    return this.periodes.find((p) => p.id === this.periodeId);
  }

  onPeriodeChange(): void {
    this.refresh();
  }

  refresh(): void {
    const periode = this.periodeSelectionnee;
    if (!periode || !periode.anneeScolaireId) {
      this.liste = [];
      return;
    }
    this.loading = true;
    this.validationBulletinService.list(periode.id!, periode.anneeScolaireId).subscribe({
      next: (res: any) => {
        this.liste = res.data ?? (Array.isArray(res) ? res : []);
        this.loading = false;
      },
      error: () => {
        this.notification.error('Impossible de charger les statuts de validation');
        this.loading = false;
      }
    });
  }

  // ── Vue détaillée classe ─────────────────────────────────────────────

  ouvrirClasse(item: ValidationBulletin): void {
    this.classeSelectionnee = item;
    this.chargerDetailClasse();
    this.chargerEtapesMatieres(item);
  }

  fermerClasse(): void {
    this.classeSelectionnee = null;
    this.bulletins = [];
    this.matieres = [];
    this.etapeParMatiere = new Map();
  }

  private chargerEtapesMatieres(item: ValidationBulletin): void {
    this.noteService.getProgressionsClasse(item.classeId, item.periodeId).subscribe({
      next: (progressions) => {
        this.etapeParMatiere = new Map(progressions.map((p) => [p.matiereId, p.etape]));
      },
      error: () => (this.etapeParMatiere = new Map())
    });
  }

  /** Une matière n'est ouvrable par l'admin, depuis cet écran de validation, qu'une fois que le
      professeur l'a soumise (SOUMISE ou VALIDEE) — tant qu'elle est en BROUILLON, il continue d'y
      travailler et l'admin ne doit pas intervenir. */
  matiereEditable(matiereId: number): boolean {
    return this.etapeParMatiere.get(matiereId) !== 'BROUILLON';
  }

  private chargerDetailClasse(): void {
    if (!this.classeSelectionnee) return;
    this.loadingDetail = true;
    this.bulletinService.genererClasse(this.classeSelectionnee.classeId, this.classeSelectionnee.periodeId).subscribe({
      next: (bulletins) => {
        this.bulletins = bulletins ?? [];
        const parId = new Map<number, string>();
        for (const b of this.bulletins) {
          for (const m of b.matieres ?? []) {
            parId.set(m.matiereId, m.matiereLibelle);
          }
        }
        this.matieres = Array.from(parId, ([id, libelle]) => ({ id, libelle })).sort((a, b) =>
          a.libelle.localeCompare(b.libelle)
        );
        this.loadingDetail = false;
      },
      error: () => {
        this.notification.error('Impossible de charger les notes de la classe');
        this.loadingDetail = false;
      }
    });
  }

  moyenneMatiere(bulletin: Bulletin, matiereId: number): number | null {
    return bulletin.matieres?.find((m) => m.matiereId === matiereId)?.moyenne ?? null;
  }

  ouvrirMatiere(matiereId: number, matiereLibelle: string): void {
    if (!this.classeSelectionnee) return;
    const item = this.classeSelectionnee;
    const periode = this.periodeSelectionnee;

    // Cet écran de correction n'a aucune restriction d'édition liée à la soumission du professeur
    // (contrairement à la saisie directe) — seule une classe déjà validée reste en lecture seule,
    // et il faut explicitement la dévalider pour la modifier à nouveau.
    const lectureSeule = item.valide;

    this.dialog
      .open(MatiereNotesDialogComponent, {
        width: '900px',
        maxWidth: '95vw',
        panelClass: 'professional-dialog',
        data: {
          classeId: item.classeId,
          matiereId,
          periodeId: item.periodeId,
          classeLibelle: item.classeLibelle,
          matiereLibelle,
          periodeLibelle: periode?.libelle ?? '',
          readonly: lectureSeule
        }
      })
      .afterClosed()
      .subscribe((modifie) => {
        if (modifie) this.chargerDetailClasse();
      });
  }

  // ── Actions valider / dévalider / pdf ────────────────────────────────

  async valider(item: ValidationBulletin): Promise<void> {
    const periode = this.periodeSelectionnee;
    if (!periode?.anneeScolaireId) return;

    const confirmed = await this.notification.confirm(
      `Valider les bulletins de ${item.classeLibelle} pour ${periode.libelle} ? ` +
        `Les notes de cette classe ne pourront plus être modifiées tant que la validation n'est pas annulée.`,
      'Valider les bulletins'
    );
    if (!confirmed) return;

    this.validationBulletinService.valider(item.classeId, item.periodeId, periode.anneeScolaireId).subscribe({
      next: () => {
        this.notification.success('Bulletins validés');
        this.refresh();
        if (this.classeSelectionnee?.classeId === item.classeId) {
          this.classeSelectionnee = { ...this.classeSelectionnee, valide: true };
        }
      },
      error: (err) => this.notification.error(err)
    });
  }

  async devalider(item: ValidationBulletin): Promise<void> {
    const confirmed = await this.notification.confirm(
      `Annuler la validation des bulletins de ${item.classeLibelle} ? La saisie des notes sera de nouveau possible.`,
      'Annuler la validation'
    );
    if (!confirmed) return;

    this.validationBulletinService.devalider(item.classeId, item.periodeId).subscribe({
      next: () => {
        this.notification.success('Validation annulée');
        this.refresh();
        if (this.classeSelectionnee?.classeId === item.classeId) {
          this.classeSelectionnee = { ...this.classeSelectionnee, valide: false };
        }
      },
      error: (err) => this.notification.error(err)
    });
  }

  telechargerPdfEleve(b: Bulletin): void {
    this.telechargementEleveEnCours = b.eleveId;
    this.bulletinService.telechargerPdfEleve(b.eleveId, b.periodeId).subscribe({
      next: (blob) => {
        this.ouvrirApercuPdf(blob, `bulletin-${b.eleveNomComplet}-${b.periodeId}.pdf`, b.eleveNomComplet);
        this.telechargementEleveEnCours = null;
      },
      error: () => {
        this.notification.error('Impossible de générer le bulletin de cet élève');
        this.telechargementEleveEnCours = null;
      }
    });
  }

  /** Ouvre le PDF dans un aperçu intégré à l'application (pas d'onglet externe) — un bouton
      "Télécharger" dans le dialogue permet de l'enregistrer à tout moment. */
  private ouvrirApercuPdf(blob: Blob, filename: string, title: string): void {
    this.dialog.open(PdfPreviewDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      height: '860px',
      maxHeight: '92vh',
      panelClass: 'professional-dialog',
      data: { blob, filename, title }
    });
  }

  telechargerPdf(item: ValidationBulletin): void {
    this.telechargementEnCours = item.classeId;
    this.bulletinService.telechargerPdfClasse(item.classeId, item.periodeId).subscribe({
      next: (blob) => {
        this.ouvrirApercuPdf(blob, `bulletins-${item.classeLibelle}-${item.periodeId}.pdf`, item.classeLibelle ?? 'Bulletins');
        this.telechargementEnCours = null;
      },
      error: () => {
        this.notification.error('Impossible de générer le PDF (vérifiez que des notes existent pour cette classe)');
        this.telechargementEnCours = null;
      }
    });
  }
}
