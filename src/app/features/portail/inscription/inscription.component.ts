import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EleveService } from '../../../core/services/eleve.service';
import { ClasseService } from '../../../core/services/classe.service';
import { AnneeScolaireService } from '../../../core/services/annee-scolaire.service';
import { FraisScolaireService } from '../../../core/services/frais-scolaire.service';
import { PaiementService } from '../../../core/services/paiement.service';
import { DossierEleveService } from '../../../core/services/dossier-eleve.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TuteurAuthService } from '../../../core/services/tuteur-auth.service';

import { Eleve } from '../../../core/models/eleve.model';
import { Classe } from '../../../core/models/classe.model';
import { AnneeScolaire } from '../../../core/models/annee-scolaire.model';

import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { NbStepperModule, NbIconModule } from '@nebular/theme';

@Component({
  selector: 'app-portal-inscription',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatButtonModule, 
    MatCardModule, 
    MatInputModule, MatFormFieldModule, 
    MatSelectModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    NbStepperModule, NbIconModule
    ],
  templateUrl: './inscription.component.html',
  styleUrl: './inscription.component.scss'
})
export class PortalInscriptionComponent implements OnInit {
  @ViewChild('stepper') stepper: any;

  private fb = inject(FormBuilder);
  private eleveService = inject(EleveService);
  private classeService = inject(ClasseService);
  private anneeService = inject(AnneeScolaireService);
  private fraisService = inject(FraisScolaireService);
  private paiementService = inject(PaiementService);
  private dossierService = inject(DossierEleveService);
  private authService = inject(TuteurAuthService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  firstForm!: FormGroup;
  secondForm!: FormGroup;
  loading = false;
  showSimulation = false;
  
  mesEnfants: Eleve[] = [];
  classes: Classe[] = [];
  annees: AnneeScolaire[] = [];
  montantTotal = 0;
  currentEleveId: number | null = null;
  currentDossierId: number | null = null;

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  private initForms(): void {
    this.firstForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      sexe: ['M', Validators.required],
      dateNaissance: ['', Validators.required]
    });

    this.secondForm = this.fb.group({
      classeId: [null, Validators.required],
      anneeScolaireId: [null, Validators.required],
      telephonePaiement: ['', [Validators.required, Validators.pattern(/^[0-9]{8,}$/)]]
    });

    this.secondForm.valueChanges.subscribe(val => {
      if (val.classeId && val.anneeScolaireId) {
        this.updateMontant(val.classeId, val.anneeScolaireId);
      }
    });
  }

  onEleveSelected(eleve: Eleve): void {
    this.currentEleveId = eleve.id || null;
    this.firstForm.patchValue({
      nom: eleve.nom,
      prenom: eleve.prenom,
      sexe: eleve.sexe,
      dateNaissance: eleve.dateNaissance
    });
  }

  private loadData(): void {
    this.authService.tuteur$.pipe(
      switchMap((tuteur: any) => {
        if (tuteur && tuteur.id) {
          return this.eleveService.getAll(1, 50, '', tuteur.id);
        }
        return of({ data: [] });
      })
    ).subscribe({
      next: (res: any) => {
        this.mesEnfants = res.data || (Array.isArray(res) ? res : []);
      }
    });

    this.classeService.getAll(1, 100).subscribe((res: any) => this.classes = res.data || (Array.isArray(res) ? res : []));
    this.anneeService.getAll(1, 100).subscribe((res: any) => this.annees = res.data || (Array.isArray(res) ? res : []));
  }

  private updateMontant(classeId: number, anneeId: number): void {
    this.fraisService.getFraisByClasseAndAnnee(classeId, anneeId).subscribe(frais => {
      this.montantTotal = frais.reduce((acc, f) => acc + (f.montant || 0), 0);
    });
  }

  goBack(): void {
    this.router.navigate(['/portail/dashboard']);
  }

  async processPaiement(): Promise<void> {
    if (this.secondForm.invalid) return;

    this.loading = true;
    const tuteur = this.authService.currentTuteurValue;
    
    // 1. Créer ou obtenir l'élève
    let eleveObs$: Observable<any>;
    if (this.currentEleveId) {
      eleveObs$ = of({ id: this.currentEleveId });
    } else {
      eleveObs$ = this.eleveService.create({
        ...this.firstForm.value,
        tuteurId: tuteur.id
      });
    }

    eleveObs$.pipe(
      // 2. Créer le dossier
      switchMap((eleve: any) => {
        return this.dossierService.create({
          eleveId: eleve.id,
          classeId: this.secondForm.value.classeId,
          anneeScolaireId: this.secondForm.value.anneeScolaireId,
          statutId: 1 // DÉPOSÉ
        });
      }),
      // 3. Initier le paiement
      switchMap((dossier: any) => {
        this.currentDossierId = dossier.id;
        return this.paiementService.initiateMomo({
          telephone: this.secondForm.value.telephonePaiement,
          montant: this.montantTotal,
          dossierId: dossier.id!
        });
      })
    ).subscribe({
      next: () => {
        this.loading = false;
        this.showSimulation = true;
        this.stepper.next(); // Aller à l'étape de simulation
      },
      error: (err: any) => {
        console.error(err);
        this.notification.error('Une erreur est survenue lors de l\'inscription');
        this.loading = false;
      }
    });
  }

  confirmSimulation(): void {
    this.notification.success('Paiement confirmé ! Votre dossier est maintenant validé.');
    this.router.navigate(['/portail/dashboard']);
  }

  cancelSimulation(): void {
    this.showSimulation = false;
    this.stepper.previous();
    this.notification.warning('Paiement annulé.');
  }
}