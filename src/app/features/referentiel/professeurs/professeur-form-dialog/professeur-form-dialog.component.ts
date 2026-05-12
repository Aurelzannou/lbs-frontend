import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ProfesseurService } from '../../../../core/services/professeur.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Professeur } from '../../../../core/models/professeur.model';
import { NbButtonModule, NbInputModule, NbSpinnerModule } from '@nebular/theme';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-professeur-form-dialog',
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
  templateUrl: './professeur-form-dialog.component.html',
  styleUrl: './professeur-form-dialog.component.scss'
})
export class ProfesseurFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProfesseurFormDialogComponent>);
  public data = inject<Professeur | undefined>(MAT_DIALOG_DATA);
  private professeurService = inject(ProfesseurService);
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
      nom: [this.data?.nom || '', [Validators.required]],
      prenom: [this.data?.prenom || '', [Validators.required]],
      num: [this.data?.num || ''],
      email: [this.data?.email || '', [Validators.email]],
      code: [this.data?.code || '']
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const confirmed = await this.notification.confirm(
        this.isEdit ? 'Voulez-vous modifier ce professeur ?' : 'Voulez-vous créer ce professeur ?',
        'Confirmation'
      );
      if (!confirmed) return;

      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.professeurService.update(this.data.uuid, val)
        : this.professeurService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Professeur mis à jour' : 'Professeur créé');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde professeur:', err);
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
