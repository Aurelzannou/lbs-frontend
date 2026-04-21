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
import { TypeActeService } from '../../../../core/services/type-acte.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TypeActe } from '../../../../core/models/type-acte.model';

@Component({
  selector: 'app-type-acte-form-dialog',
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
  templateUrl: './type-acte-form-dialog.component.html',
  styleUrl: './type-acte-form-dialog.component.scss'
})
export class TypeActeFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<TypeActeFormDialogComponent>);
  public data = inject<TypeActe | undefined>(MAT_DIALOG_DATA);
  private typeActeService = inject(TypeActeService);
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
        ? this.typeActeService.update(this.data.uuid, val)
        : this.typeActeService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Type d\'acte mis à jour' : 'Type d\'acte créé');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erreur sauvegarde type d\'acte:', err);
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
