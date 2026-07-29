import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { HttpParams } from '@angular/common/http';
import {
  ClasseMatiereANoter,
  FeuilleSaisieNotes,
  FeuilleSaisieNotesRequest
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

  getMesClasses(anneeScolaireId: number): Observable<ClasseMatiereANoter[]> {
    const params = new HttpParams().set('anneeScolaireId', anneeScolaireId.toString());
    return this.api.get<ClasseMatiereANoter[]>(`${this.endpoint}/mes-classes`, params);
  }
}
