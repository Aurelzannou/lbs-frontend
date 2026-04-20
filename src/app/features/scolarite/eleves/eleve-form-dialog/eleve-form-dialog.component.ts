import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { 
  NbButtonModule, 
  NbInputModule, 
  NbIconModule, 
  NbCardModule,
  NbFormFieldModule,
  NbSpinnerModule
} from '@nebular/theme';
import { EleveService } from '../../../../core/services/eleve.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Eleve } from '../../../../core/models/eleve.model';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-eleve-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbButtonModule,
    NbInputModule,
    NbIconModule,
    NbCardModule,
    NbFormFieldModule,
    NbSpinnerModule,
    NgSelectModule
  ],
  template: `
    <nb-card [nbSpinner]="loading" nbSpinnerStatus="primary">
      <nb-card-header>
        <nb-icon [icon]="isEdit ? 'edit-2-outline' : 'person-add-outline'" style="margin-right:8px"></nb-icon>
        {{ isEdit ? 'Modifier l\'élève' : 'Saisir un nouvel élève' }}
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          
          <div class="row">
            <div class="col-6 mb-3">
              <label class="label required">Matricule</label>
              <input nbInput fullWidth formControlName="matricule" placeholder="Ex: MAT-2024-001" 
                     [readonly]="isEdit" style="text-transform: uppercase;">
            </div>
            <div class="col-6 mb-3">
              <label class="label required">Sexe</label>
              <ng-select [items]="sexes"
                         bindLabel="label"
                         bindValue="value"
                         formControlName="sexe"
                         placeholder="Sélectionnez le sexe"
                         [searchable]="true"
                         class="custom-ng-select">
              </ng-select>
            </div>
          </div>

          <div class="row">
            <div class="col-6 mb-3">
              <label class="label required">Nom</label>
              <input nbInput fullWidth formControlName="nom" placeholder="Nom de famille">
            </div>
            <div class="col-6 mb-3">
              <label class="label required">Prénom</label>
              <input nbInput fullWidth formControlName="prenom" placeholder="Prénoms">
            </div>
          </div>

          <div class="row">
            <div class="col-12 mb-3">
              <label class="label">Date de Naissance</label>
              <input nbInput fullWidth type="date" formControlName="dateNaissance">
            </div>
          </div>

          <div class="row">
            <div class="col-12 mb-3">
              <label class="label">Lieu de Naissance</label>
              <input nbInput fullWidth formControlName="lieuNaissance" placeholder="Lieu de naissance">
            </div>
          </div>

          <div class="row">
            <div class="col-6 mb-3">
              <label class="label">Téléphone</label>
              <input nbInput fullWidth formControlName="telephone" placeholder="Ex: +229 ...">
            </div>
            <div class="col-6 mb-3">
              <label class="label">Email</label>
              <input nbInput fullWidth formControlName="email" placeholder="email@exemple.com">
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button nbButton ghost type="button" (click)="onCancel()">Annuler</button>
            <button nbButton status="primary" type="submit" [disabled]="form.invalid || loading">
              {{ isEdit ? 'Mettre à jour' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    nb-card {
      margin: 0;
      min-width: 580px;
    }
    .label {
      display: block;
      margin-bottom: 4px;
      font-weight: 600;
      font-size: 0.8rem;
      color: #8f9bb3;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .label.required::after {
      content: ' *';
      color: #ff3d71;
    }
    .row {
      display: flex;
      gap: 1rem;
    }
    .col-6 { flex: 1; }
    .col-12 { flex: 0 0 100%; }
    .mb-3 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1.5rem; }
    .gap-2 { gap: 0.5rem; }
    .d-flex { display: flex; }
    .justify-content-end { justify-content: flex-end; }
  `]
})
export class EleveFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eleveService = inject(EleveService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  isEdit = false;
  loading = false;

  sexes = [
    { label: 'Masculin', value: 'M' },
    { label: 'Féminin', value: 'F' }
  ];

  constructor(
    public dialogRef: MatDialogRef<EleveFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Eleve
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      matricule: [this.data?.matricule || '', Validators.required],
      nom: [this.data?.nom || '', Validators.required],
      prenom: [this.data?.prenom || '', Validators.required],
      sexe: [this.data?.sexe || null, Validators.required],
      dateNaissance: [this.data?.dateNaissance || ''],
      lieuNaissance: [this.data?.lieuNaissance || ''],
      telephone: [this.data?.telephone || ''],
      email: [this.data?.email || '', [Validators.email]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const confirmed = await this.notification.confirm(
      this.isEdit ? 'Voulez-vous vraiment modifier cet élève ?' : 'Voulez-vous vraiment enregistrer cet élève ?',
      'Confirmation'
    );

    if (!confirmed) return;

    this.loading = true;
    const request = this.form.value;

    const obs$ = this.isEdit
      ? this.eleveService.update(this.data.matricule, request)
      : this.eleveService.create(request);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Élève mis à jour' : 'Élève créé avec succès');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notification.error('Erreur lors de la sauvegarde de l\'élève');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
