import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { EmploiDuTempsService } from '../../../../core/services/emploi-du-temps.service';
import { MatiereService } from '../../../../core/services/matiere.service';
import { ProfesseurService } from '../../../../core/services/professeur.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { EmploiDuTemps } from '../../../../core/models/emploi-du-temps.model';
import { Matiere } from '../../../../core/models/matiere.model';
import { Professeur } from '../../../../core/models/professeur.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgSelectModule } from '@ng-select/ng-select';

interface EmploiDuTempsDialogData {
  classeId: number;
  anneeScolaireId: number;
  seance?: EmploiDuTemps;
}

@Component({
  selector: 'app-emploi-du-temps-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    NgSelectModule
  ],
  templateUrl: './emploi-du-temps-form-dialog.component.html',
  styleUrl: './emploi-du-temps-form-dialog.component.scss'
})
export class EmploiDuTempsFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private emploiDuTempsService = inject(EmploiDuTempsService);
  private matiereService = inject(MatiereService);
  private professeurService = inject(ProfesseurService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  isEdit = false;

  matieres: Matiere[] = [];
  professeurs: Professeur[] = [];
  professeursFiltres: Professeur[] = [];

  readonly jours = [
    { code: 'LUNDI', label: 'Lundi' },
    { code: 'MARDI', label: 'Mardi' },
    { code: 'MERCREDI', label: 'Mercredi' },
    { code: 'JEUDI', label: 'Jeudi' },
    { code: 'VENDREDI', label: 'Vendredi' },
    { code: 'SAMEDI', label: 'Samedi' }
  ];

  constructor(
    public dialogRef: MatDialogRef<EmploiDuTempsFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EmploiDuTempsDialogData
  ) {}

  ngOnInit(): void {
    this.isEdit = !!this.data?.seance;
    this.initForm();
    this.loadData();

    // Si la matière change, on recalcule la liste de professeurs proposée et on
    // désélectionne le professeur courant s'il n'enseigne plus cette matière.
    this.form.get('matiereId')!.valueChanges.subscribe((matiereId: number | null) => {
      this.recalculerProfesseursFiltres(matiereId);
      const profId = this.form.get('profId')!.value;
      if (matiereId && profId && !this.professeursFiltres.some((p) => p.id === profId)) {
        this.form.get('profId')!.setValue(null);
      }
    });
  }

  /** Ne propose que les professeurs enseignant la matière sélectionnée (propriété stable,
      recalculée seulement quand nécessaire — évite de fournir une nouvelle référence de
      tableau à ng-select à chaque cycle de détection de changements, ce qui casse la
      sélection dans son menu déroulant). */
  private recalculerProfesseursFiltres(matiereId: number | null): void {
    const parMatiere = !matiereId
      ? this.professeurs
      : this.professeurs.filter((p) => (p.matiereIds || []).includes(matiereId));

    // Un professeur inactif ne doit plus pouvoir être affecté à un nouveau cours, mais reste
    // visible s'il est déjà celui affecté à la séance qu'on est en train de modifier.
    const profIdActuel = this.data?.seance?.profId;
    this.professeursFiltres = parMatiere.filter((p) => p.actif !== false || p.id === profIdActuel);
  }

  private initForm(): void {
    const s = this.data?.seance;
    this.form = this.fb.group({
      jour: [s?.jour || null, [Validators.required]],
      heureDebut: [s?.heureDebut || null, [Validators.required]],
      heureFin: [s?.heureFin || null, [Validators.required]],
      matiereId: [s?.matiereId || null, [Validators.required]],
      profId: [s?.profId || null, [Validators.required]]
    });
  }

  private loadData(): void {
    this.matiereService.getAll(1, 100).subscribe((res) => (this.matieres = res.data || []));
    this.professeurService.getAll(1, 100).subscribe((res) => {
      this.professeurs = res.data || [];
      this.recalculerProfesseursFiltres(this.form.get('matiereId')!.value);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    if (this.form.value.heureFin <= this.form.value.heureDebut) {
      this.notification.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    const confirmed = await this.notification.confirm(
      this.isEdit ? 'Voulez-vous modifier ce cours ?' : 'Voulez-vous ajouter ce cours ?'
    );
    if (!confirmed) return;

    this.loading = true;
    const payload = {
      ...this.form.value,
      classeId: this.data.classeId,
      anneeScolaireId: this.data.anneeScolaireId
    };

    const obs =
      this.isEdit && this.data.seance?.uuid
        ? this.emploiDuTempsService.update(this.data.seance.uuid, payload)
        : this.emploiDuTempsService.create(payload);

    obs.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Cours modifié' : 'Cours ajouté');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.notification.error(err);
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
