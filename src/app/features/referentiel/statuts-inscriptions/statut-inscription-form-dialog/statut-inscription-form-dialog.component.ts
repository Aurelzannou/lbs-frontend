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
import { StatutInscriptionService } from '../../../../core/services/statut-inscription.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { StatutInscription } from '../../../../core/models/statut-inscription.model';

@Component({
  selector: 'app-statut-inscription-form-dialog',
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
  templateUrl: './statut-inscription-form-dialog.component.html',
  styleUrl: './statut-inscription-form-dialog.component.scss'
})
export class StatutInscriptionFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<StatutInscriptionFormDialogComponent>);
  public data = inject<StatutInscription | undefined>(MAT_DIALOG_DATA);
  private statutService = inject(StatutInscriptionService);
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
        ? this.statutService.update(this.data.uuid, val)
        : this.statutService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Statut mis à jour' : 'Statut créé');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde statut:', err);
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
