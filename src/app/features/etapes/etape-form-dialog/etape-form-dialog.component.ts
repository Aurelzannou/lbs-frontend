import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { EtapeService } from '../../../core/services/etape.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Etape } from '../../../core/models/etape.model';

@Component({
  selector: 'app-etape-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ isEdit ? 'Modifier' : 'Nouvelle' }} Étape</h2>
    <mat-dialog-content [formGroup]="form">
      <div class="form-fields">
        <mat-form-field appearance="outline">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" placeholder="ex: INS, PRE_INS...">
          <mat-error *ngIf="form.get('code')?.hasError('required')">Le code est requis</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Libellé</mat-label>
          <input matInput formControlName="libelle" placeholder="ex: Inscription">
          <mat-error *ngIf="form.get('libelle')?.hasError('required')">Le libellé est requis</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" placeholder="Description courte de l'étape"></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" [disabled]="form.invalid || loading" (click)="onSubmit()">
        {{ isEdit ? 'Mettre à jour' : 'Enregistrer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-top: 10px;
      min-width: 350px;
    }
    mat-form-field {
      width: 100%;
    }
  `
})
export class EtapeFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private etapeService = inject(EtapeService);
  private notification = inject(NotificationService);
  
  form!: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<EtapeFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Etape
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', Validators.required],
      libelle: [this.data?.libelle || '', Validators.required],
      description: [this.data?.description || '']
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const request = this.form.value;

    const obs$ = this.isEdit 
      ? this.etapeService.update(this.data.uuid!, request)
      : this.etapeService.create(request);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Étape mise à jour' : 'Étape créée avec succès');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notification.error('Une erreur est survenue');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
