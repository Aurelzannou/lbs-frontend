import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface PointMensuel {
  mois: string; // "yyyy-MM"
  valeur: number;
}

export interface Repartition {
  libelle: string;
  valeur: number;
}

export interface AvancementClasse {
  classeLibelle: string;
  matieresValidees: number;
  matieresAttendues: number;
}

export interface MatiereATraiter {
  classeLibelle: string;
  matiereLibelle: string;
  etat: 'A_VALIDER' | 'EN_SAISIE';
  pretePourSoumission: boolean;
}

export interface NotesBulletins {
  periodeLibelle: string;
  feuillesSoumises: number;
  feuillesAttendues: number;
  classesBulletinValide: number;
  classesTotal: number;
  moyenneEtablissement: number | null;
  tauxReussite: number | null;
  repartitionMoyennes: Repartition[];
  nbPeriodesAnnee: number;
  matieresValideesAnnee: number;
  matieresAttenduesAnnee: number;
  validationParClasse: AvancementClasse[];
  matieresAValider: number;
  matieresEnSaisie: number;
  matieresATraiter: MatiereATraiter[];
}

export interface DashboardStats {
  anneeScolaireLibelle: string;
  nbEleves: number;
  nbProfesseurs: number;
  nbClasses: number;
  dossiersDeposes: number;
  dossiersAcceptes: number;
  dossiersInscrits: number;
  dossiersRefuses: number;
  totalDossiers: number;
  totalEncaisse: number;
  totalDepenses: number;
  soldeCaisses: number;
  resteAPayerTotal: number;
  inscriptionsParMois: PointMensuel[];
  encaissementsParMois: PointMensuel[];
  dossiersParStatut: Repartition[];
  effectifParClasse: Repartition[];
  notesBulletins: NotesBulletins | null;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = inject(ApiService);

  getStats(): Observable<DashboardStats> {
    return this.api.get<DashboardStats>('/api/dashboard/stats');
  }
}
