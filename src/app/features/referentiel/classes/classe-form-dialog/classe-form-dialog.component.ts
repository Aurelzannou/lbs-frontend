import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ClasseService } from '../../../../core/services/classe.service';
import { NiveauService } from '../../../../core/services/niveau.service';
import { MatiereService } from '../../../../core/services/matiere.service';
import { CoefficientService } from '../../../../core/services/coefficient.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Classe } from '../../../../core/models/classe.model';
import { Niveau } from '../../../../core/models/niveau.model';
import { Matiere } from '../../../../core/models/matiere.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-classe-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    NgSelectModule
  ],
  templateUrl: './classe-form-dialog.component.html',
  styleUrl: './classe-form-dialog.component.scss'
})
export class ClasseFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ClasseFormDialogComponent>);
  public data = inject<Classe | undefined>(MAT_DIALOG_DATA);
  private classeService = inject(ClasseService);
  private niveauService = inject(NiveauService);
  private matiereService = inject(MatiereService);
  private coefficientService = inject(CoefficientService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  saving = false;
  niveaux: Niveau[] = [];
  matieres: Matiere[] = [];
  isEdit = false;

  /** Coefficients déjà définis pour le niveau sélectionné : matiereId -> valeur. */
  private coefParNiveau: Record<number, number> = {};

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
    this.loadNiveaux();
    this.loadMatieres();

    // Défauts initiaux (édition) : coefficients renvoyés par le backend pour la classe.
    this.coefParNiveau = { ...(this.data?.coefficients || {}) };
    if (this.data?.niveau?.id) {
      this.chargerCoefficientsDuNiveau(this.data.niveau.id);
    }

    this.form.get('niveauId')!.valueChanges.subscribe((niveauId: number | null) => {
      if (niveauId) this.chargerCoefficientsDuNiveau(niveauId);
    });
    this.form.get('matiereIds')!.valueChanges.subscribe((ids: number[]) => {
      this.synchroniserLignes(ids || []);
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', [Validators.required, Validators.maxLength(20)]],
      libelle: [this.data?.libelle || '', [Validators.required]],
      niveauId: [this.data?.niveau?.id || null, [Validators.required]],
      matiereIds: [this.data?.matiereIds || []],
      matieres: this.fb.array([])
    });

    (this.data?.matiereIds || []).forEach((id) => this.lignes.push(this.creerLigne(id)));
  }

  get lignes(): FormArray {
    return this.form.get('matieres') as FormArray;
  }

  private creerLigne(matiereId: number): FormGroup {
    const coef =
      this.data?.coefficients?.[matiereId] ?? this.coefParNiveau[matiereId] ?? 1;
    return this.fb.group({
      matiereId: [matiereId, Validators.required],
      coefficient: [coef, [Validators.required, Validators.min(0.5)]]
    });
  }

  /** Ajoute/retire les lignes de coefficient en fonction des matières cochées. */
  private synchroniserLignes(ids: number[]): void {
    // retirer celles qui ne sont plus sélectionnées
    for (let i = this.lignes.length - 1; i >= 0; i--) {
      if (!ids.includes(this.lignes.at(i).value.matiereId)) this.lignes.removeAt(i);
    }
    // ajouter les nouvelles
    const presentes = this.lignes.controls.map((c) => c.value.matiereId);
    ids.filter((id) => !presentes.includes(id)).forEach((id) => this.lignes.push(this.creerLigne(id)));
  }

  private chargerCoefficientsDuNiveau(niveauId: number): void {
    this.coefficientService.getAll(1, 500).subscribe((res: any) => {
      const items: any[] = res.data ?? (Array.isArray(res) ? res : []);
      this.coefParNiveau = {};
      items
        .filter((c) => c.niveauId === niveauId)
        .forEach((c) => (this.coefParNiveau[c.matiereId] = c.valeur));
      // pré-remplir les lignes que l'utilisateur n'a pas encore modifiées
      this.lignes.controls.forEach((ctrl) => {
        const g = ctrl as FormGroup;
        const mid = g.value.matiereId;
        if (!g.get('coefficient')!.dirty && this.coefParNiveau[mid] != null) {
          g.get('coefficient')!.setValue(this.coefParNiveau[mid], { emitEvent: false });
        }
      });
    });
  }

  libelleMatiere(matiereId: number): string {
    return this.matieres.find((m) => m.id === matiereId)?.libelle || `#${matiereId}`;
  }

  ajusterCoef(index: number, delta: number): void {
    const ctrl = (this.lignes.at(index) as FormGroup).get('coefficient')!;
    const valeur = Math.max(0.5, Math.round((Number(ctrl.value || 0) + delta) * 2) / 2);
    ctrl.setValue(valeur);
    ctrl.markAsDirty();
  }

  private loadNiveaux(): void {
    this.loading = true;
    this.niveauService.getAll(1, 100).subscribe({
      next: (res) => {
        this.niveaux = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.notification.error('Erreur lors du chargement des niveaux');
        this.loading = false;
      }
    });
  }

  private loadMatieres(): void {
    this.matiereService.getAll(1, 100).subscribe((res: any) => {
      this.matieres = res.data ?? (Array.isArray(res) ? res : []);
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const confirmed = await this.notification.confirm(
      this.isEdit ? 'Voulez-vous modifier cette classe ?' : 'Voulez-vous créer cette classe ?',
      'Confirmation'
    );
    if (!confirmed) return;

    this.saving = true;
    const v = this.form.value;
    const matieres = (v.matieres || []).map((l: any) => ({
      matiereId: l.matiereId,
      coefficient: Number(l.coefficient)
    }));
    const payload = {
      code: v.code,
      libelle: v.libelle,
      niveauId: v.niveauId,
      matiereIds: matieres.map((m: any) => m.matiereId),
      matieres
    };

    const obs =
      this.isEdit && this.data?.uuid
        ? this.classeService.update(this.data.uuid, payload)
        : this.classeService.create(payload);

    obs.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Classe mise à jour' : 'Classe créée');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.notification.error(err?.error?.message || 'Erreur lors de la sauvegarde');
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
