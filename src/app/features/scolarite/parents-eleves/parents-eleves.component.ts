import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EleveService } from '../../../core/services/eleve.service';
import { TuteurService } from '../../../core/services/tuteur.service';
import { EleveTuteurService } from '../../../core/services/eleve-tuteur.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Eleve } from '../../../core/models/eleve.model';
import { Tuteur } from '../../../core/models/tuteur.model';
import { EleveTuteur, LIENS_PARENTE } from '../../../core/models/eleve-tuteur.model';

@Component({
  selector: 'app-parents-eleves',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgSelectModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './parents-eleves.component.html',
  styleUrl: './parents-eleves.component.scss'
})
export class ParentsElevesComponent implements OnInit {
  private eleveService = inject(EleveService);
  private tuteurService = inject(TuteurService);
  private eleveTuteurService = inject(EleveTuteurService);
  private notification = inject(NotificationService);

  readonly liens = LIENS_PARENTE;

  eleves: (Eleve & { nomComplet?: string })[] = [];
  eleveId: number | null = null;
  loadingEleves = false;

  parents: EleveTuteur[] = [];
  loadingParents = false;

  // Formulaire d'association
  formOuvert = false;
  saving = false;
  tuteurs: Tuteur[] = [];
  loadingTuteurs = false;
  tuteurInput$ = new Subject<string>();
  nouveauTuteurId: number | null = null;
  nouveauLien: string | null = null;
  nouveauContactUrgence = false;

  ngOnInit(): void {
    this.loadingEleves = true;
    this.eleveService.getAll(1, 500).subscribe({
      next: (res) => {
        const liste: Eleve[] = res.data?.data || res.data || (Array.isArray(res) ? res : []);
        this.eleves = liste.map((e) => ({
          ...e,
          nomComplet: `${e.nom} ${e.prenom}${e.classe?.libelle ? ' — ' + e.classe.libelle : ''}`
        }));
        this.loadingEleves = false;
      },
      error: () => {
        this.notification.error('Impossible de charger la liste des élèves');
        this.loadingEleves = false;
      }
    });

    this.tuteurInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => this.rechercherTuteurs(term));
  }

  onEleveChange(): void {
    this.formOuvert = false;
    this.parents = [];
    if (!this.eleveId) return;
    this.chargerParents();
  }

  chargerParents(): void {
    if (!this.eleveId) return;
    this.loadingParents = true;
    this.eleveTuteurService.listerParEleve(this.eleveId).subscribe({
      next: (res) => {
        this.parents = res || [];
        this.loadingParents = false;
      },
      error: () => {
        this.notification.error("Impossible de charger les parents de l'élève");
        this.loadingParents = false;
      }
    });
  }

  rechercherTuteurs(term: string): void {
    this.loadingTuteurs = true;
    this.tuteurService.rechercher(term).subscribe({
      next: (res) => {
        this.tuteurs = res.data?.data || res.data || [];
        this.loadingTuteurs = false;
      },
      error: () => {
        this.tuteurs = [];
        this.loadingTuteurs = false;
      }
    });
  }

  ouvrirForm(): void {
    this.formOuvert = true;
    this.nouveauTuteurId = null;
    this.nouveauLien = null;
    this.nouveauContactUrgence = false;
    this.rechercherTuteurs('');
  }

  annulerForm(): void {
    this.formOuvert = false;
  }

  associer(): void {
    if (!this.eleveId || !this.nouveauTuteurId) return;
    this.saving = true;
    this.eleveTuteurService
      .associer({
        eleveId: this.eleveId,
        tuteurId: this.nouveauTuteurId,
        lienParente: this.nouveauLien || undefined,
        contactUrgence: this.nouveauContactUrgence
      })
      .subscribe({
        next: () => {
          this.notification.success('Parent associé');
          this.saving = false;
          this.formOuvert = false;
          this.chargerParents();
        },
        error: (err) => {
          this.notification.error(err?.error?.message || "Impossible d'associer ce parent");
          this.saving = false;
        }
      });
  }

  async dissocier(lien: EleveTuteur): Promise<void> {
    const nom = lien.tuteur ? `${lien.tuteur.prenom} ${lien.tuteur.nom}` : 'ce parent';
    const confirmed = await this.notification.confirm(
      `Retirer l'accès de ${nom} à cet élève ?`
    );
    if (!confirmed) return;

    this.eleveTuteurService.dissocier(lien.uuid!).subscribe({
      next: () => {
        this.notification.success('Parent dissocié');
        this.chargerParents();
      },
      error: () => this.notification.error('Erreur lors de la dissociation')
    });
  }

  get eleveSelectionne(): (Eleve & { nomComplet?: string }) | undefined {
    return this.eleves.find((e) => e.id === this.eleveId);
  }
}
