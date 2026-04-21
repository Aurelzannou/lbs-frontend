import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { 
  NbButtonModule, 
  NbInputModule, 
  NbFormFieldModule, 
  NbIconModule,
  NbSpinnerModule
} from '@nebular/theme';
import { CoefficientService } from '../../../../core/services/coefficient.service';
import { NiveauService } from '../../../../core/services/niveau.service';
import { MatiereService } from '../../../../core/services/matiere.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Coefficient } from '../../../../core/models/coefficient.model';
import { Niveau } from '../../../../core/models/niveau.model';
import { Matiere } from '../../../../core/models/matiere.model';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-coefficient-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    NbSpinnerModule,
    NgSelectModule
  ],
  templateUrl: './coefficient-form-dialog.component.html',
  styleUrl: './coefficient-form-dialog.component.scss'
})
export class CoefficientFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CoefficientFormDialogComponent>);
  public data = inject<Coefficient | undefined>(MAT_DIALOG_DATA);
  private coefficientService = inject(CoefficientService);
  private niveauService = inject(NiveauService);
  private matiereService = inject(MatiereService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  saving = false;
  niveaux: Niveau[] = [];
  matieres: Matiere[] = [];
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      niveauId: [this.data?.niveau?.id || null, [Validators.required]],
      matiereId: [this.data?.matiere?.id || null, [Validators.required]],
      valeur: [this.data?.valeur || 1, [Validators.required, Validators.min(1)]]
    });
  }

  private loadData(): void {
    this.loading = true;
    // Load both niveaux and matieres
    this.niveauService.getAll(1, 100).subscribe(res => this.niveaux = res.data || []);
    this.matiereService.getAll(1, 100).subscribe(res => {
      this.matieres = res.data || [];
      this.loading = false;
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.coefficientService.update(this.data.uuid, val)
        : this.coefficientService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Coefficient mis à jour' : 'Coefficient créé');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde coefficient:', err);
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
