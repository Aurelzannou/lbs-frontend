import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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

@Component({
  selector: 'app-portal-inscription',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatButtonModule, MatCardModule,
    MatInputModule, MatFormFieldModule,
    MatSelectModule, MatIconModule,
    MatProgressSpinnerModule, MatStepperModule,
  ],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.scss'
})
export class PortalInscriptionComponent implements OnInit {
  @ViewChild('stepper') stepper: any;

  private inscriptionService  = inject(InscriptionService);
  private periodeService      = inject(PeriodeInscriptionService);
  private notification        = inject(NotificationService);
  private router              = inject(Router);
  private fb                  = inject(FormBuilder);

  firstForm!: FormGroup;
  secondForm!: FormGroup;
  loading        = false;
  stepIndex      = 0;

  mesEnfants:  Eleve[]        = [];
  classes:     Classe[]       = [];
  annees:      AnneeScolaire[]= [];
  montantTotal = 0;
  periodeMessage: string | null = null;
  inscriptionOuverte = true;

  private currentTuteur: any    = null;
  private currentEleveId: number | null = null;
  private currentDossierId: number | null = null;

  ngOnInit(): void {
    this.initForms();
    this.loadProfil();
    this.loadReferentiels();
  }

  private initForms(): void {
    this.firstForm = this.fb.group({
      nom:           ['', Validators.required],
      prenom:        ['', Validators.required],
      sexe:          ['M', Validators.required],
      dateNaissance: ['', Validators.required]
    });

    this.secondForm = this.fb.group({
      classeId:          [null, Validators.required],
      anneeScolaireId:   [null, Validators.required],
      telephonePaiement: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]]
    });

    this.secondForm.valueChanges.subscribe(val => {
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
    this.inscriptionService.getClasses().subscribe((res: any) =>
      this.classes = res?.data || (Array.isArray(res) ? res : []));

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
      const frais: any[] = Array.isArray(res) ? res : (res?.data || []);
      this.montantTotal = frais.reduce((acc, f) => acc + (f.montant || 0), 0);
    });
  }

  onEleveSelected(eleve: Eleve): void {
    this.currentEleveId = eleve.id || null;
    this.firstForm.patchValue({
      nom: eleve.nom, prenom: eleve.prenom,
      sexe: eleve.sexe, dateNaissance: eleve.dateNaissance
    });
  }

  goBack(): void {
    this.router.navigate(['/portail/dashboard']);
  }

  soumettre(): void {
    if (this.secondForm.invalid) return;
    this.loading = true;

    const payload = {
      eleveId:         this.currentEleveId,
      ...(!this.currentEleveId ? this.firstForm.value : {}),
      classeId:        this.secondForm.value.classeId,
      anneeScolaireId: this.secondForm.value.anneeScolaireId,
      tuteurId:        this.currentTuteur?.id || null
    };

    this.inscriptionService.soumettre(payload).subscribe({
      next: (res: any) => {
        this.currentDossierId = res?.id ?? null;
        this.loading = false;
        this.stepper.next();
        this.stepIndex = 2;
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Une erreur est survenue lors de l\'inscription');
        this.loading = false;
      }
    });
  }

  confirmSimulation(): void {
    this.router.navigate(['/portail/dashboard'], {
      state: { inscriptionSuccess: true, dossierId: this.currentDossierId }
    });
  }

  cancelSimulation(): void {
    this.stepper.previous();
    this.stepIndex = 1;
    this.notification.warning('Paiement annulé.');
  }
}
