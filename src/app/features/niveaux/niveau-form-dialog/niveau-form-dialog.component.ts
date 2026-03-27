import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NiveauService } from '../../../core/services/niveau.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Niveau } from '../../../core/models/niveau.model';

@Component({
  selector: 'app-niveau-form-dialog',
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
    <h2 mat-dialog-title>{{ isEdit ? 'Modifier' : 'Nouveau' }} Niveau</h2>
    <mat-dialog-content [formGroup]="form">
      <div class="form-fields">
        <mat-form-field appearance="outline">
          <mat-label>Code</mat-label>
          <input matInput formControlName="code" placeholder="ex: CP, CE1...">
          <mat-error *ngIf="form.get('code')?.hasError('required')">Le code est requis</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Libellé</mat-label>
          <input matInput formControlName="libelle" placeholder="ex: Cours Préparatoire">
          <mat-error *ngIf="form.get('libelle')?.hasError('required')">Le libellé est requis</mat-error>
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
    }
    mat-form-field {
      width: 100%;
    }
  `
})
export class NiveauFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private niveauService = inject(NiveauService);
  private notification = inject(NotificationService);
  
  form!: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<NiveauFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Niveau
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', Validators.required],
      libelle: [this.data?.libelle || '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const request = this.form.value;

    const obs$ = this.isEdit 
      ? this.niveauService.update(this.data.uuid!, request)
      : this.niveauService.create(request);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Niveau mis à jour' : 'Niveau créé avec succès');
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
