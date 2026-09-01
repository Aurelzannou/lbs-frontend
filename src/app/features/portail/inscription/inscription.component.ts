import { Component, OnInit, inject, ViewChild, NgZone } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InscriptionService } from '../../../core/services/inscription.service';
import { PeriodeInscriptionService } from '../../../core/services/periode-inscription.service';
import { NotificationService } from '../../../core/services/notification.service';

import { Eleve } from '../../../core/models/eleve.model';
import { Classe } from '../../../core/models/classe.model';
import { AnneeScolaire } from '../../../core/models/annee-scolaire.model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';

declare const window: any;

const FEDAPAY_SCRIPT = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';

@Component({
  selector: 'app-portal-inscription',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule
  ],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.scss'
})
export class PortalInscriptionComponent implements OnInit {
  @ViewChild('stepper') stepper: any;

  private inscriptionService = inject(InscriptionService);
  private periodeService = inject(PeriodeInscriptionService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private zone = inject(NgZone);
  private document = inject(DOCUMENT);

  firstForm!: FormGroup;
  secondForm!: FormGroup;
  loading = false;
  stepIndex = 0;

  mesEnfants: Eleve[] = [];
  classes: Classe[] = [];
  annees: AnneeScolaire[] = [];
  montantTotal = 0;
  periodeMessage: string | null = null;
  inscriptionOuverte = true;

  // ── Paiement FedaPay ──────────────────────────────────────────
  /** idle = en préparation · pret = widget prêt · verif = vérification · succes · echec */
  paie: 'idle' | 'pret' | 'verif' | 'succes' | 'echec' = 'idle';
  paieMontant = 0;
  paieMessage: string | null = null;
  private fedapayTxId: number | null = null;
  private fedapayPublicKey = '';
  private fedapayCheckoutUrl: string | null = null;
  private fedapayWidget: any = null;

  private currentTuteur: any = null;
  private currentEleveId: number | null = null;
  private currentDossierId: number | null = null;

  ngOnInit(): void {
    this.initForms();
    this.loadProfil();
    this.loadReferentiels();
  }

  private initForms(): void {
    this.firstForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      sexe: ['M', Validators.required],
      dateNaissance: ['', Validators.required],
      souffrant: [false],
      provenance: ['']
    });

    this.secondForm = this.fb.group({
      classeId: [null, Validators.required],
      anneeScolaireId: [null, Validators.required],
      telephonePaiement: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]]
    });

    this.secondForm.valueChanges.subscribe((val) => {
      if (val.classeId && val.anneeScolaireId) {
        this.updateMontant(val.classeId, val.anneeScolaireId);
      }
    });
  }

  private loadProfil(): void {
    this.inscriptionService.getMonProfil().subscribe({
      next: (res: any) => {
        this.currentTuteur = res?.data || res;
        if (this.currentTuteur?.id) {
          this.inscriptionService.getMesEnfants(this.currentTuteur.id).subscribe({
            next: (r: any) => {
              this.mesEnfants = r?.data || (Array.isArray(r) ? r : []);
            }
          });
        }
      }
    });
  }

  private loadReferentiels(): void {
    this.inscriptionService
      .getClasses()
      .subscribe((res: any) => (this.classes = res?.data || (Array.isArray(res) ? res : [])));

    this.inscriptionService.getAnneesScolaires().subscribe((res: any) => {
      this.annees = res?.data?.content || res?.data || (Array.isArray(res) ? res : []);
    });

    // Vérifier la période chaque fois que l'année scolaire change
    this.secondForm.get('anneeScolaireId')!.valueChanges.subscribe((anneeId: number) => {
      if (anneeId) this.verifierPeriode(anneeId);
    });
  }

  private verifierPeriode(anneeScolaireId: number): void {
    this.periodeService.getPeriodeActive(anneeScolaireId).subscribe({
      next: (periode: any) => {
        const p = periode?.data || periode;
        if (!p) {
          this.inscriptionOuverte = false;
          this.periodeMessage = "Aucune période d'inscription ouverte pour cette année scolaire.";
        } else {
          this.inscriptionOuverte = true;
          const cloture = new Date(p.dateCloture);
          this.periodeMessage = `Inscriptions ouvertes jusqu'au ${cloture.toLocaleDateString('fr-FR')}.`;
        }
      },
      error: () => {
        this.inscriptionOuverte = true;
        this.periodeMessage = null;
      }
    });
  }

  private updateMontant(classeId: number, anneeId: number): void {
    this.inscriptionService.getFrais(classeId, anneeId).subscribe((res: any) => {
      const frais: any[] = Array.isArray(res) ? res : res?.data || [];
      this.montantTotal = frais.reduce((acc, f) => acc + (f.montant || 0), 0);
    });
  }

  onEleveSelected(eleve: Eleve): void {
    this.currentEleveId = eleve.id || null;
    this.firstForm.patchValue({
      nom: eleve.nom,
      prenom: eleve.prenom,
      sexe: eleve.sexe,
      dateNaissance: eleve.dateNaissance,
      souffrant: eleve.souffrant || false,
      provenance: eleve.provenance || ''
    });
  }

  goBack(): void {
    this.router.navigate(['/portail/dashboard']);
  }

  // ── Étape 2 → soumission du dossier puis initialisation du paiement ──
  soumettre(): void {
    if (this.secondForm.invalid) return;
    this.loading = true;

    const payload = {
      eleveId: this.currentEleveId,
      ...(!this.currentEleveId ? this.firstForm.value : {}),
      classeId: this.secondForm.value.classeId,
      anneeScolaireId: this.secondForm.value.anneeScolaireId,
      tuteurId: this.currentTuteur?.id || null
    };

    this.inscriptionService.soumettre(payload).subscribe({
      next: (res: any) => {
        this.currentDossierId = res?.id ?? res?.data?.id ?? null;
        if (!this.currentDossierId) {
          this.loading = false;
          this.notification.error('Dossier créé mais identifiant introuvable.');
          return;
        }
        this.initPaiement();
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error("Une erreur est survenue lors de l'inscription");
        this.loading = false;
      }
    });
  }

  private initPaiement(): void {
    const tel = this.secondForm.value.telephonePaiement;
    this.inscriptionService.initPaiement(this.currentDossierId!, tel).subscribe({
      next: (res: any) => {
        const d = res?.data ?? res;
        this.fedapayTxId = d.fedapayTransactionId;
        this.fedapayPublicKey = d.publicKey;
        this.fedapayCheckoutUrl = d.checkoutUrl ?? null;
        this.paieMontant = d.montant ?? this.montantTotal;
        this.loading = false;
        this.paie = 'idle';
        this.paieMessage = null;
        this.stepper.next();
        this.stepIndex = 2;
        this.preparerWidget();
      },
      error: (err: any) => {
        this.loading = false;
        // le message métier ("Aucun frais d'inscription configuré…") est aussi affiché
        // par l'intercepteur ; on reste à l'étape 2 pour corriger.
        this.notification.error(err);
      }
    });
  }

  // ── Étape 3 : widget FedaPay ──────────────────────────────────
  preparerWidget(): void {
    this.paie = 'idle';
    this.paieMessage = null;
    this.loadFedaPayScript()
      .then(() => {
        const FedaPay = window.FedaPay;
        if (!FedaPay || !this.fedapayTxId) {
          this.basculerVersPageHebergee("Le widget de paiement n'a pas pu se charger.");
          return;
        }
        // 1. afficher le bouton, 2. au tick suivant l'attacher au SDK (le bouton est alors dans le DOM)
        this.paie = 'pret';
        setTimeout(() => {
          try {
            this.fedapayWidget = FedaPay.init('#fedapay-btn', {
              public_key: this.fedapayPublicKey,
              transaction: { id: this.fedapayTxId },
              onComplete: (resp: any) => this.zone.run(() => this.onPaiementComplete(resp))
            });
          } catch (e) {
            console.error('FedaPay.init', e);
            this.zone.run(() => this.basculerVersPageHebergee("Le widget de paiement n'a pas pu s'initialiser."));
          }
        });
      })
      .catch(() => this.basculerVersPageHebergee('Impossible de charger FedaPay. Vérifiez votre connexion.'));
  }

  /** Repli : rediriger vers la page de paiement hébergée FedaPay si le widget inline échoue. */
  private basculerVersPageHebergee(raison: string): void {
    if (this.fedapayCheckoutUrl) {
      console.warn('[fedapay] repli page hébergée :', raison);
      window.location.href = this.fedapayCheckoutUrl;
      return;
    }
    this.paie = 'echec';
    this.paieMessage = raison;
  }

  private loadFedaPayScript(): Promise<void> {
    if (window.FedaPay) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const existing = this.document.querySelector(`script[src="${FEDAPAY_SCRIPT}"]`);
      if (existing) {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject());
        if (window.FedaPay) resolve();
        return;
      }
      const s = this.document.createElement('script');
      s.src = FEDAPAY_SCRIPT;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject();
      this.document.body.appendChild(s);
    });
  }

  /** Ouvre le modal FedaPay (bouton "Payer maintenant"). */
  ouvrirPaiement(): void {
    if (this.fedapayWidget?.open) {
      this.fedapayWidget.open();
      return;
    }
    // le SDK branche normalement lui-même le clic sur #fedapay-btn ;
    // si rien ne s'ouvre, on tente la page hébergée
    setTimeout(() => {
      if (this.paie === 'pret' && this.fedapayCheckoutUrl && !this.fedapayWidget) {
        window.location.href = this.fedapayCheckoutUrl;
      }
    }, 400);
  }

  private onPaiementComplete(resp: any): void {
    const FedaPay = window.FedaPay;
    const dismissed =
      resp?.reason === FedaPay?.DIALOG_DISMISSED || resp?.reason === 'DIALOG_DISMISSED';
    if (dismissed) {
      this.notification.info('Paiement non finalisé. Vous pouvez réessayer.');
      return;
    }

    this.paie = 'verif';
    this.paieMessage = 'Vérification du paiement en cours…';

    this.inscriptionService.verifierPaiement(this.fedapayTxId!).subscribe({
      next: (res: any) => {
        const d = res?.data ?? res;
        if (d?.paye) {
          this.paie = 'succes';
          this.paieMessage = null;
          this.notification.success(
            `Paiement de ${this.paieMontant.toLocaleString('fr-FR')} FCFA reçu. Votre dossier est transmis à l'administration.`
          );
          setTimeout(() => this.retourEspace(), 2600);
        } else {
          this.paie = 'echec';
          this.paieMessage =
            "Le paiement n'a pas encore été confirmé (statut : " +
            (d?.fedapayStatut || 'inconnu') +
            '). Réessayez dans un instant.';
        }
      },
      error: () => {
        this.paie = 'echec';
        this.paieMessage =
          "Impossible de vérifier le paiement. Si vous avez été débité, contactez l'école.";
      }
    });
  }

  /** Retour à l'étape 2 pour relancer un paiement. */
  reessayerPaiement(): void {
    this.paie = 'idle';
    this.paieMessage = null;
    this.fedapayTxId = null;
    this.fedapayWidget = null;
    this.stepIndex = 1;
    this.stepper.previous();
  }

  /** Retour à l'espace parent, avec la bannière de confirmation. */
  retourEspace(): void {
    this.router.navigate(['/portail/dashboard'], {
      state: {
        inscriptionSuccess: true,
        paiementConfirme: this.paie === 'succes',
        montant: this.paieMontant,
        dossierId: this.currentDossierId
      }
    });
  }
}
