import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import { ValidationBulletin } from '../models/validation-bulletin.model';
import { FeuilleSaisieNotes, FeuilleSaisieNotesRequest } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class ValidationBulletinService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/validation-bulletins';

  /** Service de correction des notes propre à cet écran — distinct de NoteService.enregistrerFeuille
      (portail professeur + écran admin "Saisie des notes"), qui reste limité à la période en cours. */
  corrigerNotes(payload: FeuilleSaisieNotesRequest): Observable<FeuilleSaisieNotes> {
    return this.api.put<FeuilleSaisieNotes>(`${this.endpoint}/notes`, payload);
  }

  getStatut(classeId: number, periodeId: number): Observable<ValidationBulletin> {
    const params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('periodeId', periodeId.toString());
    return this.api.get<ValidationBulletin>(`${this.endpoint}/statut`, params);
  }

  list(periodeId: number, anneeScolaireId: number): Observable<ValidationBulletin[]> {
    const params = new HttpParams()
      .set('periodeId', periodeId.toString())
      .set('anneeScolaireId', anneeScolaireId.toString());
    return this.api.get<ValidationBulletin[]>(this.endpoint, params);
  }

  valider(classeId: number, periodeId: number, anneeScolaireId: number): Observable<ValidationBulletin> {
    const params = new HttpParams().set('anneeScolaireId', anneeScolaireId.toString());
    return this.api.put<ValidationBulletin>(
      `${this.endpoint}/${classeId}/${periodeId}/valider?${params.toString()}`,
      {}
    );
  }

  devalider(classeId: number, periodeId: number): Observable<ValidationBulletin> {
    return this.api.put<ValidationBulletin>(`${this.endpoint}/${classeId}/${periodeId}/devalider`, {});
  }
}
