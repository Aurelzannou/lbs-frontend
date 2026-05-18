import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Niveau } from '../../../../core/models/niveau.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { NiveauService } from '../../../../core/services/niveau.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-niveau-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule, MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './niveau-form-dialog.component.html',
  styleUrl: './niveau-form-dialog.component.scss'
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

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const confirmed = await this.notification.confirm(
      this.isEdit ? 'Voulez-vous vraiment modifier ce niveau ?' : 'Voulez-vous vraiment créer ce niveau ?',
      'Confirmation d\'enregistrement'
    );

    if (!confirmed) return;

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
      error: (err) => {
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
