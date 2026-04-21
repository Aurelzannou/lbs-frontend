import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { 
  NbButtonModule, 
  NbInputModule, 
  NbFormFieldModule, 
  NbIconModule,
  NbSpinnerModule
} from '@nebular/theme';
import { MatiereService } from '../../../../core/services/matiere.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Matiere } from '../../../../core/models/matiere.model';

@Component({
  selector: 'app-matiere-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    NbSpinnerModule
  ],
  templateUrl: './matiere-form-dialog.component.html',
  styleUrl: './matiere-form-dialog.component.scss'
})
export class MatiereFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<MatiereFormDialogComponent>);
  public data = inject<Matiere | undefined>(MAT_DIALOG_DATA);
  private matiereService = inject(MatiereService);
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
      libelle: [this.data?.libelle || '', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.matiereService.update(this.data.uuid, val)
        : this.matiereService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Matière mise à jour' : 'Matière créée');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde matière:', err);
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
