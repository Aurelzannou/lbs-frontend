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
import { Profil, ProfilService } from '../../../../core/services/profil.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-profil-form-dialog',
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
  templateUrl: './profil-form-dialog.component.html',
  styleUrl: './profil-form-dialog.component.scss'
})
export class ProfilFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profilService = inject(ProfilService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<ProfilFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Profil
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', [Validators.required, Validators.maxLength(20)]],
      libelle: [this.data?.libelle || '', [Validators.required, Validators.maxLength(100)]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const confirmed = await this.notification.confirm(
      this.isEdit ? 'Voulez-vous vraiment modifier ce profil ?' : 'Voulez-vous vraiment créer ce profil ?',
      'Confirmation'
    );

    if (!confirmed) return;

    this.loading = true;
    const request = this.form.value;

    const obs$ = this.isEdit
      ? this.profilService.update(this.data.id!, request)
      : this.profilService.create(request);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Profil mis à jour' : 'Profil créé avec succès');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notification.error('Une erreur est survenue lors de la sauvegarde');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
