import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ClasseService } from '../../../../core/services/classe.service';
import { NiveauService } from '../../../../core/services/niveau.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Classe } from '../../../../core/models/classe.model';
import { Niveau } from '../../../../core/models/niveau.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-classe-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule, MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    NgSelectModule
  ],
  templateUrl: './classe-form-dialog.component.html',
  styleUrl: './classe-form-dialog.component.scss'
})
export class ClasseFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<ClasseFormDialogComponent>);
  public data = inject<Classe | undefined>(MAT_DIALOG_DATA);
  private classeService = inject(ClasseService);
  private niveauService = inject(NiveauService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  saving = false;
  niveaux: Niveau[] = [];
  isEdit = false;

  ngOnInit(): void {
    this.isEdit = !!this.data;
    this.initForm();
    this.loadNiveaux();
  }

  private initForm(): void {
    this.form = this.fb.group({
      code: [this.data?.code || '', [Validators.required, Validators.maxLength(20)]],
      libelle: [this.data?.libelle || '', [Validators.required]],
      niveauId: [this.data?.niveau?.id || null, [Validators.required]]
    });
  }

  private loadNiveaux(): void {
    this.loading = true;
    this.niveauService.getAll(1, 100).subscribe({
      next: (res) => {
        this.niveaux = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.notification.error('Erreur lors du chargement des niveaux');
        this.loading = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.valid) {
      const confirmed = await this.notification.confirm(
        this.isEdit ? 'Voulez-vous modifier cette classe ?' : 'Voulez-vous créer cette classe ?',
        'Confirmation'
      );
      if (!confirmed) return;

      this.saving = true;
      const val = this.form.value;
      
      const obs = this.isEdit && this.data?.uuid
        ? this.classeService.update(this.data.uuid, val)
        : this.classeService.create(val);

      obs.subscribe({
        next: () => {
          this.notification.success(this.isEdit ? 'Classe mise à jour' : 'Classe créée');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.saving = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
