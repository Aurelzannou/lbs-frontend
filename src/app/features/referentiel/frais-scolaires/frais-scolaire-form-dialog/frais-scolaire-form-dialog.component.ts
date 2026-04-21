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
import { FraisScolaireService } from '../../../../core/services/frais-scolaire.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FraisScolaire } from '../../../../core/models/frais-scolaire.model';
import { Classe } from '../../../../core/models/classe.model';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-frais-scolaire-form-dialog',
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
  templateUrl: './frais-scolaire-form-dialog.component.html',
  styleUrl: './frais-scolaire-form-dialog.component.scss'
})
export class FraisScolaireFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FraisScolaireFormDialogComponent>);
  public data = inject<FraisScolaire | undefined>(MAT_DIALOG_DATA);
  private fraisScolaireService = inject(FraisScolaireService);
  private classeService = inject(ClasseService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  saving = false;
  classes: Classe[] = [];
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
    this.loadClasses();
  }

  private initForm(): void {
    this.form = this.fb.group({
      classeId: [this.data?.classe?.id || null, [Validators.required]],
      code: [this.data?.code || '', [Validators.required]],
      montant: [this.data?.montant || 0, [Validators.required, Validators.min(0)]]
    });
  }

  private loadClasses(): void {
    this.loading = true;
    this.classeService.getAll(1, 100).subscribe({
      next: (res) => {
        this.classes = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.notification.error('Erreur chargement classes');
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.fraisScolaireService.update(this.data.uuid, val)
        : this.fraisScolaireService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Frais mis à jour' : 'Frais créé');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde frais:', err);
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
