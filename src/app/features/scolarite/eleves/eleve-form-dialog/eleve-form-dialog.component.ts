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
import { EleveService } from '../../../../core/services/eleve.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Eleve } from '../../../../core/models/eleve.model';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-eleve-form-dialog',
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
    NgSelectModule
  ],
  templateUrl: './eleve-form-dialog.component.html',
  styleUrl: './eleve-form-dialog.component.scss'
})
export class EleveFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eleveService = inject(EleveService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  isEdit = false;
  loading = false;

  sexes = [
    { label: 'Masculin', value: 'M' },
    { label: 'Féminin', value: 'F' }
  ];

  constructor(
    public dialogRef: MatDialogRef<EleveFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Eleve
  ) {
    this.isEdit = !!data;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      matricule: [this.data?.matricule || '', Validators.required],
      nom: [this.data?.nom || '', Validators.required],
      prenom: [this.data?.prenom || '', Validators.required],
      sexe: [this.data?.sexe || null, Validators.required],
      dateNaissance: [this.data?.dateNaissance || ''],
      lieuNaissance: [this.data?.lieuNaissance || ''],
      telephone: [this.data?.telephone || ''],
      email: [this.data?.email || '', [Validators.email]]
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const confirmed = await this.notification.confirm(
      this.isEdit ? 'Voulez-vous vraiment modifier cet élève ?' : 'Voulez-vous vraiment enregistrer cet élève ?',
      'Confirmation'
    );

    if (!confirmed) return;

    this.loading = true;
    const request = this.form.value;

    const obs$ = this.isEdit
      ? this.eleveService.update(this.data.matricule, request)
      : this.eleveService.create(request);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Élève mis à jour' : 'Élève créé avec succès');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.notification.error('Erreur lors de la sauvegarde de l\'élève');
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
