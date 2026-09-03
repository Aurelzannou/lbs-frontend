import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import {
  ClasseMatiereANoter,
  FeuilleSaisieNotes,
  FeuilleSaisieNotesRequest,
  ProgressionEtapeHistorique,
  ProgressionMatiereRequest,
  ProgressionSaisieNotes,
  VerrouProgressionRequest
} from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/notes';

  getFeuille(classeId: number, matiereId: number, periodeId: number): Observable<FeuilleSaisieNotes> {
    const params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('matiereId', matiereId.toString())
      .set('periodeId', periodeId.toString());
    return this.api.get<FeuilleSaisieNotes>(`${this.endpoint}/feuille`, params);
  }

  enregistrerFeuille(payload: FeuilleSaisieNotesRequest): Observable<FeuilleSaisieNotes> {
    return this.api.put<FeuilleSaisieNotes>(`${this.endpoint}/feuille`, payload);
  }

  getMesClasses(): Observable<ClasseMatiereANoter[]> {
    return this.api.get<ClasseMatiereANoter[]>(`${this.endpoint}/mes-classes`);
  }

  getProgression(classeId: number, matiereId: number, periodeId: number): Observable<ProgressionSaisieNotes> {
    const params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('matiereId', matiereId.toString())
      .set('periodeId', periodeId.toString());
    return this.api.get<ProgressionSaisieNotes>(`${this.endpoint}/progression`, params);
  }

  getProgressionsClasse(classeId: number, periodeId: number): Observable<ProgressionSaisieNotes[]> {
    const params = new HttpParams().set('classeId', classeId.toString()).set('periodeId', periodeId.toString());
    return this.api.get<ProgressionSaisieNotes[]>(`${this.endpoint}/progression/classe`, params);
  }

  verrouillerColonne(payload: VerrouProgressionRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/verrouiller`, payload);
  }

  deverrouillerColonne(payload: VerrouProgressionRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/deverrouiller`, payload);
  }

  validerColonne(payload: VerrouProgressionRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/valider-colonne`, payload);
  }

  soumettreMatiere(payload: ProgressionMatiereRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/soumettre`, payload);
  }

  validerMatiere(payload: ProgressionMatiereRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/valider`, payload);
  }

  devaliderMatiere(payload: ProgressionMatiereRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/devalider-matiere`, payload);
  }

  /** Admin : renvoie une matière reçue à l'enseignant (SOUMISE → BROUILLON). */
  renvoyerAuProfesseur(payload: ProgressionMatiereRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/renvoyer`, payload);
  }

  /** Professeur : reprend une matière qu'il a envoyée (SOUMISE → BROUILLON), tant qu'elle n'est pas validée. */
  reprendreSaisie(payload: ProgressionMatiereRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/reprendre`, payload);
  }

  /** Admin : approuve une sélection de colonnes reçues (interrogationsJusqua / devoirsJusqua). */
  approuverColonnes(payload: ProgressionMatiereRequest): Observable<ProgressionSaisieNotes> {
    return this.api.put<ProgressionSaisieNotes>(`${this.endpoint}/progression/approuver`, payload);
  }

  getHistorique(classeId: number, matiereId: number, periodeId: number): Observable<ProgressionEtapeHistorique[]> {
    const params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('matiereId', matiereId.toString())
      .set('periodeId', periodeId.toString());
    return this.api.get<ProgressionEtapeHistorique[]>(`${this.endpoint}/progression/historique`, params);
  }
}
