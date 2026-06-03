import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EleveService } from '../../../core/services/eleve.service';
import { ClasseService } from '../../../core/services/classe.service';
import { AnneeScolaireService } from '../../../core/services/annee-scolaire.service';
import { FraisScolaireService } from '../../../core/services/frais-scolaire.service';
import { DossierEleveService } from '../../../core/services/dossier-eleve.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiService } from '../../../core/services/api.service';

import { Eleve } from '../../../core/models/eleve.model';
import { Classe } from '../../../core/models/classe.model';
import { AnneeScolaire } from '../../../core/models/annee-scolaire.model';

import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
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
    CommonModule,
    ReactiveFormsModule,
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

  private fb            = inject(FormBuilder);
  private eleveService  = inject(EleveService);
  private classeService = inject(ClasseService);
  private anneeService  = inject(AnneeScolaireService);
  private fraisService  = inject(FraisScolaireService);
  private dossierService  = inject(DossierEleveService);
  private api           = inject(ApiService);
  private notification  = inject(NotificationService);
  private router        = inject(Router);

  firstForm!: FormGroup;
  secondForm!: FormGroup;
  loading       = false;
  showSimulation = false;
  stepIndex     = 0;

  mesEnfants: Eleve[]        = [];
  classes: Classe[]          = [];
  annees: AnneeScolaire[]    = [];
  montantTotal               = 0;
  currentEleveId: number | null = null;
  currentDossierId: number | null = null;

  // Profil tuteur chargé depuis le backend
  private currentTuteur: any = null;

  ngOnInit(): void {
    this.initForms();
    this.loadTuteurProfile();
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

  /** Charge le profil du tuteur connecté via JWT */
  private loadTuteurProfile(): void {
    this.api.get<any>('/api/portail/me').subscribe({
      next: (res: any) => {
        this.currentTuteur = res?.data || res;
        if (this.currentTuteur?.id) {
          this.loadMesEnfants(this.currentTuteur.id);
        }
      },
      error: () => {
        // Non bloquant — le tuteur peut quand même remplir le formulaire
      }
    });
  }

  private loadMesEnfants(tuteurId: number): void {
    this.eleveService.getAll(1, 50, '', tuteurId).subscribe({
      next: (res: any) => {
        this.mesEnfants = res?.data || (Array.isArray(res) ? res : []);
      }
    });
  }

  private loadReferentiels(): void {
    this.classeService.getAll(1, 100).subscribe((res: any) =>
      this.classes = res?.data || (Array.isArray(res) ? res : []));
    this.anneeService.getAll(1, 100).subscribe((res: any) =>
      this.annees = res?.data || (Array.isArray(res) ? res : []));
  }

  onEleveSelected(eleve: Eleve): void {
    this.currentEleveId = eleve.id || null;
    this.firstForm.patchValue({
      nom:           eleve.nom,
      prenom:        eleve.prenom,
      sexe:          eleve.sexe,
      dateNaissance: eleve.dateNaissance
    });
  }

  private updateMontant(classeId: number, anneeId: number): void {
    this.fraisService.getFraisByClasseAndAnnee(classeId, anneeId).subscribe((res: any) => {
      // L'API peut retourner { data: [...] } ou directement un tableau
      const frais: any[] = Array.isArray(res) ? res : (res?.data || []);
      this.montantTotal = frais.reduce((acc, f) => acc + (f.montant || 0), 0);
    });
  }

  goBack(): void {
    this.router.navigate(['/portail/dashboard']);
  }

  async processPaiement(): Promise<void> {
    if (this.secondForm.invalid) return;

    this.loading = true;

    // 1. Créer ou réutiliser l'élève
    let eleveObs$: Observable<any>;
    if (this.currentEleveId) {
      eleveObs$ = of({ id: this.currentEleveId });
    } else {
      eleveObs$ = this.eleveService.create({
        ...this.firstForm.value,
        tuteurId: this.currentTuteur?.id || null
      });
    }

    eleveObs$.pipe(
      // 2. Créer le dossier (statut auto-set DEPOSE côté backend)
      switchMap((eleve: any) => {
        const eleveId = eleve?.data?.id || eleve?.id;
        return this.dossierService.create({
          eleveId,
          classeId:        this.secondForm.value.classeId,
          anneeScolaireId: this.secondForm.value.anneeScolaireId
        });
      })
    ).subscribe({
      next: (dossier: any) => {
        this.currentDossierId = dossier?.data?.id || dossier?.id;
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
      state: {
        inscriptionSuccess: true,
        dossierId: this.currentDossierId
      }
    });
  }

  cancelSimulation(): void {
    this.showSimulation = false;
    this.stepper.previous();
    this.stepIndex = 1;
    this.notification.warning('Paiement annulé.');
  }
}
