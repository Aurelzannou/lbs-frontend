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
import { Profil, ProfilService } from '../../../../core/services/profil.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-profil-form-dialog',
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
    NbSpinnerModule
  ],
  template: `
    <nb-card [nbSpinner]="loading" nbSpinnerStatus="primary">
      <nb-card-header>
        {{ isEdit ? 'Modifier le Profil' : 'Nouveau Profil' }}
      </nb-card-header>
      <nb-card-body>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="form-group mb-3">
            <label for="code" class="label">Code</label>
            <input nbInput fullWidth id="code" formControlName="code" placeholder="Ex: ADMIN, LECTEUR..." [status]="form.get('code')?.invalid && form.get('code')?.touched ? 'danger' : 'basic'">
          </div>

          <div class="form-group mb-3">
            <label for="libelle" class="label">Libellé</label>
            <input nbInput fullWidth id="libelle" formControlName="libelle" placeholder="Ex: Administrateur..." [status]="form.get('libelle')?.invalid && form.get('libelle')?.touched ? 'danger' : 'basic'">
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button nbButton ghost type="button" (click)="onCancel()">Annuler</button>
            <button nbButton status="primary" type="submit" [disabled]="form.invalid || loading">
              {{ isEdit ? 'Mettre à jour' : 'Créer' }}
            </button>
          </div>
        </form>
      </nb-card-body>
    </nb-card>
  `,
  styles: [`
    nb-card {
      margin: 0;
      min-width: 400px;
    }
  `]
})
export class ProfilFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profilService = inject(ProfilService);
  private toastr = inject(NbToastrService);

  form!: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ProfilFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Profil
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', [Validators.required, Validators.maxLength(20)]],
      libelle: [this.data?.libelle || '', [Validators.required, Validators.maxLength(100)]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const request = this.form.value;

    const obs$ = this.isEdit
      ? this.profilService.update(this.data.id!, request)
      : this.profilService.create(request);

    obs$.subscribe({
      next: () => {
        this.toastr.success(this.isEdit ? 'Profil mis à jour' : 'Profil créé avec succès', 'Succès');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.toastr.danger('Une erreur est survenue lors de la sauvegarde', 'Erreur');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
