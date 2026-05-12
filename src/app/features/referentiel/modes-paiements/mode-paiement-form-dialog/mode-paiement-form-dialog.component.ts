import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ModePaiementService } from '../../../../core/services/mode-paiement.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { ModePaiement } from '../../../../core/models/mode-paiement.model';
import { NbButtonModule, NbInputModule, NbSpinnerModule } from '@nebular/theme';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-mode-paiement-form-dialog',
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
  templateUrl: './mode-paiement-form-dialog.component.html',
  styleUrl: './mode-paiement-form-dialog.component.scss'
})
export class ModePaiementFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ModePaiementFormDialogComponent>);
  public data = inject<ModePaiement | undefined>(MAT_DIALOG_DATA);
  private modePaiementService = inject(ModePaiementService);
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
        this.isEdit ? 'Voulez-vous modifier ce mode de paiement ?' : 'Voulez-vous créer ce mode de paiement ?',
        'Confirmation'
      );
      if (!confirmed) return;

      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.modePaiementService.update(this.data.uuid, val)
        : this.modePaiementService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Mode mis à jour' : 'Mode créé');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde mode paiement:', err);
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
