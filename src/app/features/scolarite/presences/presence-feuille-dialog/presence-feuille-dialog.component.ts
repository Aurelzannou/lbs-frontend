import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PresenceService } from '../../../../core/services/presence.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EleveStatut, FeuillePresence } from '../../../../core/models/presence.model';
import { SeanceJour } from '../../../../core/models/presence.model';

interface PresenceDialogData {
  emploiTempsId: number;
  date: string;
  seance: SeanceJour;
}

@Component({
  selector: 'app-presence-feuille-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './presence-feuille-dialog.component.html',
  styleUrl: './presence-feuille-dialog.component.scss'
})
export class PresenceFeuilleDialogComponent implements OnInit {
  private presenceService = inject(PresenceService);
  private notification = inject(NotificationService);

  loading = true;
  saving = false;
  feuille: FeuillePresence | null = null;
  rechercheEleve = '';
  activeTab: 'PRESENT' | 'ABSENT' = 'PRESENT';

  constructor(
    public dialogRef: MatDialogRef<PresenceFeuilleDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PresenceDialogData
  ) {}

  ngOnInit(): void {
    this.presenceService.getFeuille(this.data.emploiTempsId, this.data.date).subscribe({
      next: (res: any) => {
        this.feuille = res.data ?? res;
        this.loading = false;
      },
      error: (err) => {
        this.notification.error(err);
        this.loading = false;
      }
    });
  }

  setProfStatut(statut: string): void {
    if (this.feuille) this.feuille.profStatut = statut;
  }

  setEleveStatut(eleveId: number, statut: string): void {
    const eleve = this.feuille?.eleves.find((e) => e.eleveId === eleveId);
    if (eleve) eleve.statut = statut;
  }

  async marquerTousPresents(): Promise<void> {
    if (!this.feuille) return;
    const nbAbsents = this.feuille.eleves.filter((e) => e.statut === 'ABSENT').length;
    if (nbAbsents > 0) {
      const confirmed = await this.notification.confirm(
        `${nbAbsents} élève(s) actuellement marqué(s) absent(s) seront remis à présent. Continuer ?`
      );
      if (!confirmed) return;
    }
    this.feuille.eleves.forEach((e) => (e.statut = 'PRESENT'));
  }

  selectTab(tab: 'PRESENT' | 'ABSENT'): void {
    this.activeTab = tab;
  }

  get presentsCount(): number {
    return this.feuille?.eleves.filter((e) => e.statut === 'PRESENT').length ?? 0;
  }

  get absentsCount(): number {
    return this.feuille?.eleves.filter((e) => e.statut === 'ABSENT').length ?? 0;
  }

  get elevesFiltres(): EleveStatut[] {
    if (!this.feuille) return [];
    const q = this.rechercheEleve.trim().toLowerCase();
    return this.feuille.eleves.filter((e) => {
      const matchTab = e.statut === this.activeTab;
      const matchRecherche = !q || e.nom.toLowerCase().includes(q) || e.prenom.toLowerCase().includes(q);
      return matchTab && matchRecherche;
    });
  }

  async enregistrer(): Promise<void> {
    if (!this.feuille) return;

    const nbAbsentsEleves = this.feuille.eleves.filter((e) => e.statut === 'ABSENT').length;
    const profAbsent = this.feuille.profStatut === 'ABSENT';
    let message = 'Voulez-vous enregistrer cette feuille de présence ?';
    if (nbAbsentsEleves > 0 || profAbsent) {
      const parts: string[] = [];
      if (profAbsent) parts.push('le professeur absent');
      if (nbAbsentsEleves > 0) parts.push(`${nbAbsentsEleves} élève(s) absent(s)`);
      message = `Confirmer l'enregistrement avec ${parts.join(' et ')} ?`;
    }
    const confirmed = await this.notification.confirm(message);
    if (!confirmed) return;

    this.saving = true;
    this.presenceService
      .enregistrerFeuille({
        emploiTempsId: this.feuille.emploiTempsId,
        date: this.feuille.date,
        profStatut: this.feuille.profStatut,
        eleves: this.feuille.eleves.map((e) => ({ eleveId: e.eleveId, statut: e.statut }))
      })
      .subscribe({
        next: () => {
          this.notification.success('Présence enregistrée');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.notification.error(err);
          this.saving = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
