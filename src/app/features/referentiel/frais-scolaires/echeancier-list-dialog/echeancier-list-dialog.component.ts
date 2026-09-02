import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EcheancierService } from '../../../../core/services/echeancier.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Echeancier } from '../../../../core/models/echeancier.model';

@Component({
  selector: 'app-echeancier-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './echeancier-list-dialog.component.html',
  styleUrl: './echeancier-list-dialog.component.scss'
})
export class EcheancierListDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EcheancierListDialogComponent>);
  public data = inject<{ fraisScolaireId: number; fraisLibelle: string; fraisMontant: number | null }>(
    MAT_DIALOG_DATA
  );
  private echeancierService = inject(EcheancierService);
  private notification = inject(NotificationService);

  echeanciers: Echeancier[] = [];
  loading = false;
  saving = false;
  form!: FormGroup;
  editingUuid: string | null = null;
  formOuvert = false;

  ngOnInit(): void {
    this.initForm();
    this.refresh();
  }

  private initForm(): void {
    this.form = this.fb.group({
      numero: [this.echeanciers.length + 1, [Validators.required, Validators.min(1)]],
      libelle: [null],
      dateEcheance: [null, Validators.required],
      montant: [null, [Validators.required, Validators.min(1)]]
    });
  }

  refresh(): void {
    this.loading = true;
    this.echeancierService.listerParFraisScolaire(this.data.fraisScolaireId).subscribe({
      next: (res) => {
        this.echeanciers = res;
        this.loading = false;
      },
      error: () => {
        this.notification.error('Impossible de charger l\'échéancier');
        this.loading = false;
      }
    });
  }

  ouvrirAjout(): void {
    this.editingUuid = null;
    this.form.reset({
      numero: this.echeanciers.length + 1,
      libelle: null,
      dateEcheance: null,
      montant: null
    });
    this.formOuvert = true;
  }

  ouvrirEdition(tranche: Echeancier): void {
    this.editingUuid = tranche.uuid ?? null;
    this.form.reset({
      numero: tranche.numero,
      libelle: tranche.libelle,
      dateEcheance: tranche.dateEcheance,
      montant: tranche.montant
    });
    this.formOuvert = true;
  }

  annulerForm(): void {
    this.formOuvert = false;
    this.editingUuid = null;
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    if (this.depassementMontant > 0) {
      this.notification.error(
        `Le total des tranches dépasserait le montant du frais de ${this.depassementMontant.toLocaleString('fr-FR')} FCFA. ` +
          `Il reste ${this.resteARepartir.toLocaleString('fr-FR')} FCFA à répartir.`
      );
      return;
    }

    this.saving = true;
    const payload = { ...this.form.value, fraisScolaireId: this.data.fraisScolaireId };

    const obs = this.editingUuid
      ? this.echeancierService.update(this.editingUuid, payload)
      : this.echeancierService.create(payload);

    obs.subscribe({
      next: () => {
        this.notification.success(this.editingUuid ? 'Tranche mise à jour' : 'Tranche ajoutée');
        this.saving = false;
        this.formOuvert = false;
        this.refresh();
      },
      error: (err) => {
        this.notification.error(
          err?.error?.message || "Erreur lors de l'enregistrement de la tranche"
        );
        this.saving = false;
      }
    });
  }

  async supprimer(tranche: Echeancier): Promise<void> {
    const confirmed = await this.notification.confirm(
      `Supprimer la tranche "${tranche.libelle || tranche.numero}" ?`
    );
    if (!confirmed) return;

    this.echeancierService.delete(tranche.uuid!).subscribe({
      next: () => {
        this.notification.success('Tranche supprimée');
        this.refresh();
      },
      error: () => this.notification.error('Erreur lors de la suppression')
    });
  }

  get totalMontant(): number {
    return this.echeanciers.reduce((sum, e) => sum + (e.montant || 0), 0);
  }

  /** Montant du frais (référence pour le contrôle de répartition). null = pas de contrôle. */
  get montantFrais(): number | null {
    return this.data.fraisMontant ?? null;
  }

  /** Total des tranches déjà enregistrées + celle en cours de saisie (hors tranche éditée). */
  get totalAvecFormEnCours(): number {
    const saisi = Number(this.form?.get('montant')?.value) || 0;
    const dejaHorsEdition = this.echeanciers
      .filter((e) => !this.editingUuid || e.uuid !== this.editingUuid)
      .reduce((sum, e) => sum + (e.montant || 0), 0);
    return dejaHorsEdition + saisi;
  }

  /** Reste à répartir avant d'atteindre le montant du frais (0 si atteint/dépassé ou pas de contrôle). */
  get resteARepartir(): number {
    if (this.montantFrais == null) return 0;
    return Math.max(0, this.montantFrais - this.totalMontant);
  }

  /** De combien la tranche en cours de saisie ferait dépasser le montant du frais (0 si OK). */
  get depassementMontant(): number {
    if (this.montantFrais == null) return 0;
    return Math.max(0, Math.round(this.totalAvecFormEnCours - this.montantFrais));
  }

  fermer(): void {
    this.dialogRef.close(true);
  }
}
