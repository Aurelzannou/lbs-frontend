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
import { Niveau } from '../../../../core/models/niveau.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { NiveauService } from '../../../../core/services/niveau.service';

@Component({
  selector: 'app-niveau-form-dialog',
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
