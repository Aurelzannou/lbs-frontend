import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { PeriodeInscription, PeriodeInscriptionRequest } from '../models/periode-inscription.model';

@Injectable({ providedIn: 'root' })
export class PeriodeInscriptionService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/periodes-inscription';

  getAll(page = 0, size = 25, filter = ''): Observable<any> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (filter.trim()) params = params.set('filter', filter.trim());
    return this.api.get<any>(this.endpoint, params);
  }

  create(data: PeriodeInscriptionRequest): Observable<PeriodeInscription> {
    return this.api.post<PeriodeInscription>(this.endpoint, data);
  }

  update(uuid: string, data: PeriodeInscriptionRequest): Observable<PeriodeInscription> {
    return this.api.put<PeriodeInscription>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }

  getPeriodeActive(anneeScolaireId: number): Observable<PeriodeInscription | null> {
    return this.api.get<PeriodeInscription | null>(`${this.endpoint}/active/${anneeScolaireId}`);
  }
}
