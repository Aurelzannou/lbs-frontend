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

  /** Caisse rattachée à l'utilisateur connecté — si présente, le champ Caisse est verrouillé
      dessus (l'agent encaisse toujours dans sa propre caisse). */
  maCaisse: Caisse | null = null;

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
      // On n'encaisse que sur un dossier accepté / inscrit (pas un dossier déposé ou refusé).
      this.dossiers = liste
        .filter((d: any) => ['ACCEPTE', 'INSCRIT'].includes(d.statutCode))
        .map((d) => ({
          ...d,
          nomComplet: `${d.eleveNom ?? ''} ${d.elevePrenom ?? ''} — ${d.classeLibelle ?? ''}`
        }));
      this.loading = false;

      if (this.data?.dossierEleveId) {
        this.form.patchValue({ dossierEleveId: this.data.dossierEleveId });
        this.onDossierSelectionne(this.data.dossierEleveId);
      }
    });
    this.modePaiementService
      .getAll(1, 100)
      .subscribe((res) => (this.modesPaiement = (res.data || []).filter((m: ModePaiement) => m.actif !== false)));
    this.caisseService
      .getAll(1, 100)
      .subscribe((res) => (this.caisses = (res.data || []).filter((c: Caisse) => c.actif !== false)));

    // Caisse de l'agent connecté : si elle existe, on la fixe et on verrouille le champ.
    this.caisseService.getMaCaisse().subscribe({
      next: (caisse) => {
        if (caisse && caisse.id) {
          this.maCaisse = caisse;
          this.form.patchValue({ caisseId: caisse.id });
          this.form.get('caisseId')?.disable();
        }
      },
      error: () => {}
    });
  }

  onDossierSelectionne(dossierId: number | null): void {
    this.form.patchValue({ fraisScolaireId: null });
    this.fraisDisponibles = [];
    this.resteAPayerFrais = null;
    const dossier = this.dossiers.find((d) => d.id === dossierId);
    if (!dossier || !dossier.classeId || !dossier.anneeScolaireId) return;

    this.fraisScolaireService
      .getFraisByClasseAndAnnee(dossier.classeId, dossier.anneeScolaireId, true)
      .subscribe((frais) => (this.fraisDisponibles = (frais || []).filter((f) => f.actif !== false)));
  }

  onFraisSelectionne(fraisScolaireId: number | null): void {
    this.resteAPayerFrais = null;
    const dossierId = this.form.value.dossierEleveId;
    if (!dossierId || !fraisScolaireId) return;

    this.suiviPaiementService.getSuiviParDossier(dossierId).subscribe((suivi) => {
      const ligne = suivi.frais.find((f) => f.fraisScolaireId === fraisScolaireId);
      this.resteAPayerFrais = ligne ? ligne.reste : null;
      // Pré-remplit le montant avec le reste à payer (l'agent peut le réduire).
      if (this.resteAPayerFrais && this.resteAPayerFrais > 0 && !this.form.value.montant) {
        this.form.patchValue({ montant: this.resteAPayerFrais });
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) return;

    const montant = Number(this.form.value.montant);
    if (this.resteAPayerFrais != null && montant > this.resteAPayerFrais + 0.01) {
      this.notification.error(
        this.resteAPayerFrais <= 0
          ? 'Ce frais est déjà entièrement réglé.'
          : `Le montant dépasse le reste à payer (${this.resteAPayerFrais.toLocaleString('fr-FR')} FCFA).`
      );
      return;
    }

    const confirmed = await this.notification.confirm('Voulez-vous enregistrer ce paiement ?');
    if (!confirmed) return;

    this.saving = true;
    // getRawValue() : inclut caisseId même quand le champ est verrouillé (caisse de l'agent).
    this.paiementService.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.notification.success('Paiement enregistré');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.notification.error(err?.error?.message || "Erreur lors de l'enregistrement du paiement");
        this.saving = false;
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
