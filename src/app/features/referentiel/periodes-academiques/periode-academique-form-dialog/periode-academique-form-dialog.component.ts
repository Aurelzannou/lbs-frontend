import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { 
  NbButtonModule, 
  NbInputModule, 
  NbFormFieldModule, 
  NbIconModule,
  NbSpinnerModule,
  NbDatepickerModule
} from '@nebular/theme';
import { PeriodeAcademiqueService } from '../../../../core/services/periode-academique.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PeriodeAcademique } from '../../../../core/models/periode-academique.model';

@Component({
  selector: 'app-periode-academique-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    NbSpinnerModule,
    NbDatepickerModule
  ],
  templateUrl: './periode-academique-form-dialog.component.html',
  styleUrl: './periode-academique-form-dialog.component.scss'
})
export class PeriodeAcademiqueFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PeriodeAcademiqueFormDialogComponent>);
  public data = inject<PeriodeAcademique | undefined>(MAT_DIALOG_DATA);
  private periodeService = inject(PeriodeAcademiqueService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  saving = false;
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', [Validators.required, Validators.maxLength(20)]],
      libelle: [this.data?.libelle || '', [Validators.required]],
      dateDebut: [this.data?.dateDebut ? new Date(this.data.dateDebut) : null, [Validators.required]],
      dateFin: [this.data?.dateFin ? new Date(this.data.dateFin) : null, [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.periodeService.update(this.data.uuid, val)
        : this.periodeService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Période mise à jour' : 'Période créée');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde période:', err);
          this.notification.error('Erreur lors de la sauvegarde');
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
