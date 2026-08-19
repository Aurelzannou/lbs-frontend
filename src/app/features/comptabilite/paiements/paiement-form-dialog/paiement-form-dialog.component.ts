import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PaiementService } from '../../../../core/services/paiement.service';
import { DossierEleveService } from '../../../../core/services/dossier-eleve.service';
import { FraisScolaireService } from '../../../../core/services/frais-scolaire.service';
import { ModePaiementService } from '../../../../core/services/mode-paiement.service';
import { CaisseService } from '../../../../core/services/caisse.service';
import { SuiviPaiementService } from '../../../../core/services/suivi-paiement.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DossierEleve } from '../../../../core/models/dossier-eleve.model';
import { FraisScolaire } from '../../../../core/models/frais-scolaire.model';
import { ModePaiement } from '../../../../core/models/mode-paiement.model';
import { Caisse } from '../../../../core/models/caisse.model';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-paiement-form-dialog',
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
  templateUrl: './paiement-form-dialog.component.html',
  styleUrl: './paiement-form-dialog.component.scss'
})
export class PaiementFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<PaiementFormDialogComponent>);
  private data = inject<{ dossierEleveId?: number } | null>(MAT_DIALOG_DATA, { optional: true });
  private paiementService = inject(PaiementService);
  private dossierEleveService = inject(DossierEleveService);
  private fraisScolaireService = inject(FraisScolaireService);
  private modePaiementService = inject(ModePaiementService);
  private caisseService = inject(CaisseService);
  private suiviPaiementService = inject(SuiviPaiementService);
  private notification = inject(NotificationService);

  form!: FormGroup;
  loading = false;
  saving = false;

  dossiers: (DossierEleve & { nomComplet?: string })[] = [];
  fraisDisponibles: FraisScolaire[] = [];
  modesPaiement: ModePaiement[] = [];
  caisses: Caisse[] = [];

  resteAPayerFrais: number | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadReferentiels();
  }

  private initForm(): void {
    this.form = this.fb.group({
      dossierEleveId: [null, Validators.required],
      fraisScolaireId: [null, Validators.required],
      datePaiement: [new Date().toISOString().substring(0, 10), Validators.required],
      montant: [null, [Validators.required, Validators.min(1)]],
      modePaiementId: [null, Validators.required],
      caisseId: [null, Validators.required],
      reference: [null],
      observation: [null]
    });
  }

  private loadReferentiels(): void {
    this.loading = true;
    this.dossierEleveService.getAll(1, 300).subscribe((res) => {
      const liste: DossierEleve[] = res.data || res || [];
      this.dossiers = liste.map((d) => ({
        ...d,
        nomComplet: `${d.eleveNom ?? ''} ${d.elevePrenom ?? ''} — ${d.classeLibelle ?? ''}`
      }));
      this.loading = false;

      if (this.data?.dossierEleveId) {
        this.form.patchValue({ dossierEleveId: this.data.dossierEleveId });
        this.onDossierSelectionne(this.data.dossierEleveId);
      }
    });
    this.modePaiementService.getAll(1, 100).subscribe((res) => (this.modesPaiement = res.data || []));
    this.caisseService.getAll(1, 100).subscribe((res) => (this.caisses = res.data || []));
  }

  onDossierSelectionne(dossierId: number | null): void {
    this.form.patchValue({ fraisScolaireId: null });
    this.fraisDisponibles = [];
    this.resteAPayerFrais = null;
    const dossier = this.dossiers.find((d) => d.id === dossierId);
    if (!dossier || !dossier.classeId || !dossier.anneeScolaireId) return;

    this.fraisScolaireService
      .getFraisByClasseAndAnnee(dossier.classeId, dossier.anneeScolaireId)
      .subscribe((frais) => (this.fraisDisponibles = frais || []));
  }

  onFraisSelectionne(fraisScolaireId: number | null): void {
    this.resteAPayerFrais = null;
    const dossierId = this.form.value.dossierEleveId;
    if (!dossierId || !fraisScolaireId) return;

    this.suiviPaiementService.getSuiviParDossier(dossierId).subscribe((suivi) => {
      const ligne = suivi.frais.find((f) => f.fraisScolaireId === fraisScolaireId);
      this.resteAPayerFrais = ligne ? ligne.reste : null;
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;
    const confirmed = await this.notification.confirm('Voulez-vous enregistrer ce paiement ?');
    if (!confirmed) return;

    this.saving = true;
    this.paiementService.create(this.form.value).subscribe({
      next: () => {
        this.notification.success('Paiement enregistré');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notification.error("Erreur lors de l'enregistrement du paiement");
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
