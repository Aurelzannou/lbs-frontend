import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DossierEleveService } from '../../../../core/services/dossier-eleve.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { EleveService } from '../../../../core/services/eleve.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DossierEleve } from '../../../../core/models/dossier-eleve.model';
import { Classe } from '../../../../core/models/classe.model';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { Eleve } from '../../../../core/models/eleve.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-dossier-eleve-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    NgSelectModule
  ],
  templateUrl: './dossier-eleve-form-dialog.component.html',
  styleUrl: './dossier-eleve-form-dialog.component.scss'
})
export class DossierEleveFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dossierService = inject(DossierEleveService);
  private classeService = inject(ClasseService);
  private anneeService = inject(AnneeScolaireService);
  private eleveService = inject(EleveService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  isEdit = false;

  classes: Classe[] = [];
  annees: AnneeScolaire[] = [];
  eleves: Eleve[] = [];

  /** Une nouvelle inscription crée un nouvel élève à l'acceptation ; une réinscription rattache
      le dossier à un élève déjà existant (typiquement un passage en classe supérieure) — son
      classeId sera mis à jour à l'acceptation, sans jamais recréer de doublon. Uniquement
      pertinent à la création : on ne change pas ce choix en modification d'un dossier existant. */
  typeInscription: 'NOUVELLE' | 'REINSCRIPTION' = 'NOUVELLE';

  /** Élève choisi en réinscription — sert à afficher un récapitulatif en lecture seule
      (son identité ne se modifie que depuis le référentiel Élèves). */
  eleveSelectionne: Eleve | null = null;

  constructor(
    public dialogRef: MatDialogRef<DossierEleveFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DossierEleve
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    if (this.isEdit) {
      this.form = this.fb.group({
        eleveId: [this.data?.eleveId || null],
        nom: [this.data?.eleveNom || null, [Validators.required]],
        prenom: [this.data?.elevePrenom || null, [Validators.required]],
        sexe: [this.data?.sexe || null, [Validators.required]],
        dateNaissance: [this.data?.dateNaissance || null],
        souffrant: [this.data?.souffrant || false],
        provenance: [this.data?.provenance || null],
        classeId: [this.data?.classeId || this.data?.classe?.id || null, [Validators.required]],
        anneeScolaireId: [
          this.data?.anneeScolaireId || this.data?.anneeScolaire?.id || null,
          [Validators.required]
        ]
      });
    } else {
      this.form = this.fb.group({
        eleveId: [null],
        nom: [null, [Validators.required]],
        prenom: [null, [Validators.required]],
        sexe: [null, [Validators.required]],
        dateNaissance: [null],
        souffrant: [false],
        provenance: [null],
        classeId: [null, [Validators.required]],
        anneeScolaireId: [null, [Validators.required]]
      });
    }
  }

  /** Bascule entre les deux modes de création — remet à zéro les champs d'identité pour éviter
      de mélanger une saisie manuelle avec un élève sélectionné juste avant, et rend le choix de
      l'élève obligatoire uniquement en réinscription. */
  changerTypeInscription(type: 'NOUVELLE' | 'REINSCRIPTION'): void {
    this.typeInscription = type;
    this.eleveSelectionne = null;
    this.form.patchValue({ eleveId: null, nom: null, prenom: null, sexe: null, dateNaissance: null, provenance: null, souffrant: false });
    const eleveIdCtrl = this.form.get('eleveId');
    eleveIdCtrl?.setValidators(type === 'REINSCRIPTION' ? [Validators.required] : []);
    eleveIdCtrl?.updateValueAndValidity();
  }

  /** Libellé lisible du sexe pour le récapitulatif en lecture seule. */
  libelleSexe(sexe: string | null | undefined): string {
    if (sexe === 'M') return 'Masculin';
    if (sexe === 'F') return 'Féminin';
    return '—';
  }

  /** L'identité (nom, prénom, sexe...) d'un élève existant se modifie depuis le référentiel
      Élèves, pas ici — on la recopie simplement pour affichage/confirmation et on verrouille les
      champs concernés ; seules la classe et l'année scolaire restent éditables. */
  onEleveSelectionne(event: any): void {
    // ng-select peut émettre l'objet complet ou la seule bindValue selon les cas — on gère les deux.
    const eleve =
      event && typeof event === 'object'
        ? this.eleves.find((e) => e.id === event.id)
        : this.eleves.find((e) => e.id === event);

    this.eleveSelectionne = eleve ?? null;
    if (!eleve) {
      this.form.patchValue({ nom: null, prenom: null, sexe: null, dateNaissance: null, provenance: null, souffrant: false });
      return;
    }
    this.form.patchValue({
      nom: eleve.nom,
      prenom: eleve.prenom,
      sexe: eleve.sexe,
      dateNaissance: eleve.dateNaissance,
      provenance: eleve.provenance,
      souffrant: eleve.souffrant
    });
  }

  private loadData(): void {
    this.classeService.getAll(1, 100).subscribe((res) => (this.classes = res.data || res));
    if (!this.isEdit) {
      this.eleveService.getAll(1, 300).subscribe((res) => {
        const liste: Eleve[] = res.data || res;
        // nomComplet sert uniquement à la recherche de l'ng-select (qui ne filtre que sur
        // bindLabel) — l'affichage lui-même reste géré par les templates ng-option/ng-label.
        this.eleves = liste.map((e) => ({ ...e, nomComplet: `${e.nom} ${e.prenom}` }));
      });
    }
    this.anneeService.getAll(1, 100).subscribe((res) => {
      const toutes: AnneeScolaire[] = res.data || res;
      // Une nouvelle inscription ne doit se faire que sur l'année scolaire active — en édition,
      // on garde aussi l'année déjà assignée au dossier même si elle n'est plus active, pour ne
      // pas faire disparaître la valeur déjà sélectionnée.
      const anneeActuelleId = this.data?.anneeScolaireId || this.data?.anneeScolaire?.id;
      this.annees = toutes.filter((a) => a.actif || a.id === anneeActuelleId);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const confirmed = await this.notification.confirm(
        this.isEdit
          ? 'Voulez-vous modifier ce dossier ?'
          : "Voulez-vous créer ce dossier d'inscription ?"
      );
      if (!confirmed) return;

      this.loading = true;
      const obs = this.isEdit
        ? this.dossierService.update(this.data.uuid!, this.form.value)
        : this.dossierService.create(this.form.value);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Dossier modifié' : 'Dossier créé');
          this.dialogRef.close(true);
        },
        error: (err) => {
          // Le backend renvoie un message métier explicite (ex: réinscription déjà existante
          // pour cette année scolaire) — on l'affiche tel quel plutôt qu'un message générique.
          this.notification.error(err?.error?.message || 'Une erreur est survenue');
          this.loading = false;
        }
      });
    }
  }
}
