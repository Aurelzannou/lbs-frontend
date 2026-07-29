import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ProfesseurService } from '../../../../core/services/professeur.service';
import { MatiereService } from '../../../../core/services/matiere.service';
import { EmploiDuTempsService } from '../../../../core/services/emploi-du-temps.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Professeur } from '../../../../core/models/professeur.model';
import { Matiere } from '../../../../core/models/matiere.model';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-professeur-form-dialog',
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
    MatSlideToggleModule,
    NgSelectModule
  ],
  templateUrl: './professeur-form-dialog.component.html',
  styleUrl: './professeur-form-dialog.component.scss'
})
export class ProfesseurFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ProfesseurFormDialogComponent>);
  public data = inject<Professeur | undefined>(MAT_DIALOG_DATA);
  private professeurService = inject(ProfesseurService);
  private matiereService = inject(MatiereService);
  private emploiDuTempsService = inject(EmploiDuTempsService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  saving = false;
  isEdit = false;
  matieres: Matiere[] = [];

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
    this.matiereService.getAll(1, 100).subscribe((res: any) => {
      this.matieres = res.data ?? (Array.isArray(res) ? res : []);
    });
  }

  private initForm(): void {
    this.form = this.fb.group({
      nom: [this.data?.nom || '', [Validators.required]],
      prenom: [this.data?.prenom || '', [Validators.required]],
      num: [this.data?.num || ''],
      email: [this.data?.email || '', [Validators.email]],
      actif: [this.data?.actif ?? true],
      matiereIds: [this.data?.matiereIds || []]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const desactivation = this.isEdit && this.data?.actif !== false && this.form.value.actif === false;

      if (desactivation && this.data?.id) {
        const nbCours = await new Promise<number>((resolve) => {
          this.emploiDuTempsService.countCoursParProf(this.data!.id!).subscribe({
            next: (res: any) => resolve(res?.data ?? res ?? 0),
            error: () => resolve(0)
          });
        });

        if (nbCours > 0) {
          const confirmeMalgreCours = await this.notification.confirm(
            `Ce professeur est actuellement affecté à ${nbCours} cours dans l'emploi du temps. ` +
              `Le rendre inactif ne supprimera pas ces cours mais il ne pourra plus être affecté à de nouveaux cours. Continuer ?`,
            'Attention'
          );
          if (!confirmeMalgreCours) return;
        }
      }

      const confirmed = await this.notification.confirm(
        this.isEdit ? 'Voulez-vous modifier ce professeur ?' : 'Voulez-vous créer ce professeur ?',
        'Confirmation'
      );
      if (!confirmed) return;

      this.saving = true;
      const val = this.form.value;

      const obs =
        this.isEdit && this.data?.uuid
          ? this.professeurService.update(this.data.uuid, val)
          : this.professeurService.create(val);

      obs.subscribe({
        next: async (professeur) => {
          this.notification.success(this.isEdit ? 'Professeur mis à jour' : 'Professeur créé');
          if (professeur?.motDePasseGenere && professeur.email) {
            await this.notification.showCredentials(professeur.email, professeur.motDePasseGenere);
          }
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
