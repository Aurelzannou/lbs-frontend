import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { EleveService } from '../../../../core/services/eleve.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Eleve } from '../../../../core/models/eleve.model';
import { ClasseService } from '../../../../core/services/classe.service';
import { Classe } from '../../../../core/models/classe.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-eleve-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule, MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    NgSelectModule,
  ],
  templateUrl: './eleve-form-dialog.component.html',
  styleUrl: './eleve-form-dialog.component.scss'
})
export class EleveFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private eleveService = inject(EleveService);
  private classeService = inject(ClasseService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  isEdit = false;
  loading = false;
  classes: Classe[] = [];

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
    this.loadClasses();
    this.form = this.fb.group({
      nom: [this.data?.nom || '', Validators.required],
      prenom: [this.data?.prenom || '', Validators.required],
      sexe: [this.data?.sexe || null, Validators.required],
      dateNaissance: [this.data?.dateNaissance || ''],
      souffrant: [this.data?.souffrant || false],
      provenance: [this.data?.provenance || ''],
      classeId: [this.data?.classeId || null, Validators.required],
      actif: [this.data?.actif ?? true]
    });
  }

  get calculatedAge(): number | null {
    const dob = this.form.get('dateNaissance')?.value;
    if (!dob) return null;
    
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  private loadClasses(): void {
    this.classeService.getAll(0, 100).subscribe({
      next: (res) => {
        this.classes = res.data || (Array.isArray(res) ? res : []);
      },
      error: (err) => console.error('Erreur chargement classes:', err)
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
      ? this.eleveService.update(this.data.uuid!, request)
      : this.eleveService.create(request);

    obs$.subscribe({
      next: () => {
        this.notification.success(this.isEdit ? 'Élève mis à jour' : 'Élève créé avec succès');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
