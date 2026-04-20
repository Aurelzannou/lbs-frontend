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
  NbSpinnerModule,
  NbToggleModule
} from '@nebular/theme';
import { AnneeScolaire } from '../../../../core/models/annee-scolaire.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { AnneeScolaireService } from '../../../../core/services/annee-scolaire.service';

@Component({
  selector: 'app-annee-scolaire-form-dialog',
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
    NbSpinnerModule,
    NbToggleModule
  ],
  templateUrl: './annee-scolaire-form-dialog.component.html',
  styleUrl: './annee-scolaire-form-dialog.component.scss'
})
export class AnneeScolaireFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private anneeScolaireService = inject(AnneeScolaireService);
  private notification = inject(NotificationService);
  
  form!: FormGroup;
  isEdit = false;
  loading = false;

  constructor(
    public dialogRef: MatDialogRef<AnneeScolaireFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AnneeScolaire
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', Validators.required],
      libelle: [this.data?.libelle || '', Validators.required],
      dateDebut: [this.data?.dateDebut ? this.data.dateDebut.substring(0, 10) : '', Validators.required],
      dateFin: [this.data?.dateFin ? this.data.dateFin.substring(0, 10) : '', Validators.required],
      actif: [this.data ? this.data.actif : true]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const confirmed = await this.notification.confirm(
      this.isEdit ? 'Voulez-vous modifier cette année scolaire ?' : 'Voulez-vous créer cette année scolaire ?'
    );

    if (!confirmed) return;

    this.loading = true;
    const request = this.form.value;

    const obs$ = this.isEdit 
      ? this.anneeScolaireService.update(this.data.uuid!, request)
      : this.anneeScolaireService.create(request);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Année scolaire mise à jour' : 'Année scolaire créée');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notification.error('Erreur lors de l\'enregistrement');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
