import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { PeriodeInscription } from '../../../../core/models/periode-inscription.model';
import { PeriodeInscriptionService } from '../../../../core/services/periode-inscription.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';

@Component({
  selector: 'app-periode-inscription-form-dialog',
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
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './periode-inscription-form-dialog.component.html',
  styleUrl: './periode-inscription-form-dialog.component.scss'
})
export class PeriodeInscriptionFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PeriodeInscriptionService);
  private anneeService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  isEdit = false;
  loading = false;
  annees: AnneeScolaire[] = [];

  constructor(
    public dialogRef: MatDialogRef<PeriodeInscriptionFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PeriodeInscription
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.anneeService.getAll(0, 100).subscribe((res: any) => {
      this.annees = res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
    });

    this.form = this.fb.group({
      anneeScolaireId: [this.data?.anneeScolaireId || null, Validators.required],
      libelle: [this.data?.libelle || ''],
      dateOuverture: [
        this.data?.dateOuverture ? this.data.dateOuverture.substring(0, 10) : '',
        Validators.required
      ],
      dateCloture: [
        this.data?.dateCloture ? this.data.dateCloture.substring(0, 10) : '',
        Validators.required
      ],
      actif: [this.data?.actif ?? true]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    const ok = await this.notification.confirm(
      this.isEdit ? 'Modifier cette période ?' : "Créer cette période d'inscription ?"
    );
    if (!ok) return;

    this.loading = true;
    const obs$ = this.isEdit
      ? this.service.update(this.data.uuid!, this.form.value)
      : this.service.create(this.form.value);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Période mise à jour' : 'Période créée');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notification.error("Erreur lors de l'enregistrement");
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
