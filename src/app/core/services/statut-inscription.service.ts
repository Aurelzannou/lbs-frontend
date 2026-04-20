import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { StatutInscription, StatutInscriptionRequest } from '../models/statut-inscription.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StatutInscriptionService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/statuts-inscriptions';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<StatutInscription> {
    return this.api.get<StatutInscription>(`${this.endpoint}/${uuid}`);
  }

  create(data: StatutInscriptionRequest): Observable<StatutInscription> {
    return this.api.post<StatutInscription>(this.endpoint, data);
  }

  update(uuid: string, data: StatutInscriptionRequest): Observable<StatutInscription> {
    return this.api.put<StatutInscription>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
