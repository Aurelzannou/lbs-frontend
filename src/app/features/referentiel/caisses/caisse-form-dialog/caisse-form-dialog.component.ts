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
import { CaisseService } from '../../../../core/services/caisse.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Caisse } from '../../../../core/models/caisse.model';

@Component({
  selector: 'app-caisse-form-dialog',
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
  templateUrl: './caisse-form-dialog.component.html',
  styleUrl: './caisse-form-dialog.component.scss'
})
export class CaisseFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CaisseFormDialogComponent>);
  public data = inject<Caisse | undefined>(MAT_DIALOG_DATA);
  private caisseService = inject(CaisseService);
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
      solde: [this.data?.solde || 0, [Validators.required, Validators.min(0)]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.caisseService.update(this.data.uuid, val)
        : this.caisseService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Caisse mise à jour' : 'Caisse créée');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde caisse:', err);
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
