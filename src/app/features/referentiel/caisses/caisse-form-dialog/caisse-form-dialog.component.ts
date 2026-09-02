import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CaisseService } from '../../../../core/services/caisse.service';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Caisse } from '../../../../core/models/caisse.model';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-caisse-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgSelectModule
  ],
  templateUrl: './caisse-form-dialog.component.html',
  styleUrl: './caisse-form-dialog.component.scss'
})
export class CaisseFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CaisseFormDialogComponent>);
  public data = inject<Caisse | undefined>(MAT_DIALOG_DATA);
  private caisseService = inject(CaisseService);
  private userService = inject(UserService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  saving = false;
  isEdit = false;
  utilisateurs: { id: number; nomComplet: string }[] = [];

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
    this.chargerUtilisateurs();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', [Validators.required, Validators.maxLength(20)]],
      libelle: [this.data?.libelle || '', [Validators.required]],
      solde: [this.data?.solde || 0, [Validators.required, Validators.min(0)]],
      utilisateurId: [this.data?.utilisateurId ?? null]
    });
  }

  private chargerUtilisateurs(): void {
    this.userService.getAll(1, 200).subscribe({
      next: (res: any) => {
        const liste: any[] = res?.data?.data || res?.data || [];
        this.utilisateurs = liste
          // On ne propose que les utilisateurs ayant le profil CAISSIER.
          .filter((u) => (u.profils || []).includes('CAISSIER'))
          .map((u) => ({
            id: u.id,
            nomComplet: `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.login || u.email
          }));
      },
      error: () => (this.utilisateurs = [])
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const confirmed = await this.notification.confirm(
        this.isEdit ? 'Voulez-vous modifier cette caisse ?' : 'Voulez-vous créer cette caisse ?',
        'Confirmation'
      );
      if (!confirmed) return;

      this.saving = true;
      const val = this.form.value;

      const obs =
        this.isEdit && this.data?.uuid
          ? this.caisseService.update(this.data.uuid, val)
          : this.caisseService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Caisse mise à jour' : 'Caisse créée');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde caisse:', err);
          this.notification.error(err?.error?.message || 'Erreur lors de la sauvegarde');
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
