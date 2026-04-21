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
import { CategorieDepenseService } from '../../../../core/services/categorie-depense.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CategorieDepense } from '../../../../core/models/categorie-depense.model';

@Component({
  selector: 'app-categorie-depense-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    NbButtonModule,
    NbInputModule,
    NbFormFieldModule,
    NbIconModule,
    NbSpinnerModule
  ],
  templateUrl: './categorie-depense-form-dialog.component.html',
  styleUrl: './categorie-depense-form-dialog.component.scss'
})
export class CategorieDepenseFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<CategorieDepenseFormDialogComponent>);
  public data = inject<CategorieDepense | undefined>(MAT_DIALOG_DATA);
  private categorieDepenseService = inject(CategorieDepenseService);
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
      code: [this.data?.code || '', [Validators.required, Validators.maxLength(20)]],
      libelle: [this.data?.libelle || '', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.categorieDepenseService.update(this.data.uuid, val)
        : this.categorieDepenseService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Catégorie mise à jour' : 'Catégorie créée');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde catégorie:', err);
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
