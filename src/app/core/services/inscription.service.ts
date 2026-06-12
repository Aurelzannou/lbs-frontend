import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';

/**
 * Service dédié au workflow de soumission d'inscription.
 * Point d'entrée unique pour le portail parent.
 */
@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private api = inject(ApiService);

  /** Soumet une inscription complète (élève + dossier) en un seul appel. */
  soumettre(data: {
    eleveId?:        number | null;
    nom?:            string;
    prenom?:         string;
    sexe?:           string;
    dateNaissance?:  string;
    classeId:        number;
    anneeScolaireId: number;
    tuteurId?:       number | null;
  }): Observable<any> {
    return this.api.post<any>('/api/inscription/soumettre', data);
  }

  /** Charge le profil du parent connecté. */
  getMonProfil(): Observable<any> {
    return this.api.get<any>('/api/portail/me');
  }

  /** Charge les enfants déjà enregistrés pour ce tuteur. */
  getMesEnfants(tuteurId: number): Observable<any> {
    const params = new HttpParams()
      .set('page', '0').set('size', '50')
      .set('tuteurId', tuteurId.toString());
    return this.api.get<any>('/api/eleves', params);
  }

  /** Charge toutes les classes disponibles. */
  getClasses(): Observable<any> {
    const params = new HttpParams().set('page', '0').set('size', '100');
    return this.api.get<any>('/api/classes', params);
  }

  /** Charge toutes les années scolaires disponibles. */
  getAnneesScolaires(): Observable<any> {
    const params = new HttpParams().set('page', '0').set('size', '100');
    return this.api.get<any>('/api/annees-scolaires', params);
  }

  /** Calcule les frais pour une classe et une année donnée. */
  getFrais(classeId: number, anneeScolaireId: number): Observable<any> {
    const params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('anneeScolaireId', anneeScolaireId.toString());
    return this.api.get<any>('/api/frais-scolaires/search', params);
  }
}
