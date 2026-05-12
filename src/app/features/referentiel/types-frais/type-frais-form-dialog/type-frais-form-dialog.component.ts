import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TypeFraisService } from '../../../../core/services/type-frais.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TypeFrais } from '../../../../core/models/type-frais.model';
import { NbButtonModule, NbInputModule, NbSpinnerModule } from '@nebular/theme';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-type-frais-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbButtonModule, NbInputModule, NbSpinnerModule,
    MatButtonModule,
    MatInputModule, MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './type-frais-form-dialog.component.html',
  styleUrl: './type-frais-form-dialog.component.scss'
})
export class TypeFraisFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TypeFraisFormDialogComponent>);
  public data = inject<TypeFrais | undefined>(MAT_DIALOG_DATA);
  private typeFraisService = inject(TypeFraisService);
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

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const confirmed = await this.notification.confirm(
        this.isEdit ? 'Voulez-vous modifier ce type de frais ?' : 'Voulez-vous créer ce type de frais ?',
        'Confirmation'
      );
      if (!confirmed) return;

      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.typeFraisService.update(this.data.uuid, val)
        : this.typeFraisService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Type de frais mis à jour' : 'Type de frais créé');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde type de frais:', err);
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
