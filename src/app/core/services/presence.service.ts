import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FeuillePresence, FeuillePresenceRequest, SeanceJour } from '../models/presence.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PresenceService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/presences';

  /** Retourne les séances du jour de la semaine correspondant à `date`, pour une classe/année données. */
  getJour(classeId: number, anneeScolaireId: number, date: string): Observable<any> {
    const params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('anneeScolaireId', anneeScolaireId.toString())
      .set('date', date);
    return this.api.get<any>(`${this.endpoint}/jour`, params);
  }

  /** Charge la feuille de présence (roster élèves + statut prof) d'un créneau à une date donnée. */
  getFeuille(emploiTempsId: number, date: string): Observable<any> {
    const params = new HttpParams().set('emploiTempsId', emploiTempsId.toString()).set('date', date);
    return this.api.get<any>(`${this.endpoint}/feuille`, params);
  }

  enregistrerFeuille(payload: FeuillePresenceRequest): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/feuille`, payload);
  }

  /** Historique de présence des enfants du tuteur connecté — portail parent. */
  getMesEnfants(): Observable<any> {
    return this.api.get<any>(`${this.endpoint}/mes-enfants`);
  }
}
