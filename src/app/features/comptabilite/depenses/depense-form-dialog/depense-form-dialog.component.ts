import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { DepenseScolaireService } from '../../../../core/services/depense-scolaire.service';
import { CaisseService } from '../../../../core/services/caisse.service';
import { CategorieDepenseService } from '../../../../core/services/categorie-depense.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Caisse } from '../../../../core/models/caisse.model';
import { CategorieDepense } from '../../../../core/models/categorie-depense.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-depense-form-dialog',
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
    NgSelectModule
  ],
  templateUrl: './depense-form-dialog.component.html',
  styleUrl: './depense-form-dialog.component.scss'
})
export class DepenseFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DepenseFormDialogComponent>);
  private depenseService = inject(DepenseScolaireService);
  private caisseService = inject(CaisseService);
  private categorieDepenseService = inject(CategorieDepenseService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  saving = false;
  caisses: Caisse[] = [];
  categories: CategorieDepense[] = [];

  ngOnInit(): void {
    this.initForm();
    this.loadData();
  }

  private initForm(): void {
    this.form = this.fb.group({
      caisseId: [null, Validators.required],
      categorieDepenseId: [null, Validators.required],
      montant: [null, [Validators.required, Validators.min(1)]],
      dateDepense: [new Date().toISOString().substring(0, 10), Validators.required],
      motif: [null, Validators.required],
      reference: [null]
    });
  }

  private loadData(): void {
    this.loading = true;
    this.caisseService
      .getAll(1, 100)
      .subscribe((res) => (this.caisses = (res.data || []).filter((c: Caisse) => c.actif !== false)));
    this.categorieDepenseService.getAll(1, 100).subscribe((res) => {
      this.categories = (res.data || []).filter((c: CategorieDepense) => c.actif !== false);
      this.loading = false;
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    const confirmed = await this.notification.confirm('Voulez-vous enregistrer cette dépense ?');
    if (!confirmed) return;

    this.saving = true;
    this.depenseService.create(this.form.value).subscribe({
      next: () => {
        this.notification.success('Dépense enregistrée');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notification.error("Erreur lors de l'enregistrement de la dépense");
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
