import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FraisScolaire, FraisScolaireRequest } from '../models/frais-scolaire.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FraisScolaireService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/frais-scolaires';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<FraisScolaire> {
    return this.api.get<FraisScolaire>(`${this.endpoint}/${uuid}`);
  }

  create(data: FraisScolaireRequest): Observable<FraisScolaire> {
    return this.api.post<FraisScolaire>(this.endpoint, data);
  }

  update(uuid: string, data: FraisScolaireRequest): Observable<FraisScolaire> {
    return this.api.put<FraisScolaire>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }

  /**
   * @param paiementGuichet true pour ne récupérer que le type de frais encaissé au guichet
   *   (SCOLARITE) — utilisé par l'écran /comptabilite/paiements.
   */
  getFraisByClasseAndAnnee(
    classeId: number,
    anneeId: number,
    paiementGuichet = false
  ): Observable<FraisScolaire[]> {
    let params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('anneeScolaireId', anneeId.toString());
    if (paiementGuichet) params = params.set('paiementGuichet', 'true');
    return this.api.get<FraisScolaire[]>(`${this.endpoint}/search`, params);
  }
}
