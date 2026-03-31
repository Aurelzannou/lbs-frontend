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
import { EtapeService } from '../../../../core/services/etape.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Etape } from '../../../../core/models/etape.model';

@Component({
  selector: 'app-etape-form-dialog',
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
  templateUrl: './etape-form-dialog.component.html',
  styleUrl: './etape-form-dialog.component.scss'
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
