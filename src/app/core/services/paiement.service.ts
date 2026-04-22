import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Paiement } from '../models/paiement.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/paiements';

  getAll(page: number = 1, size: number = 10, filter: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString());
    
    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }

    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Paiement> {
    return this.api.get<Paiement>(`${this.endpoint}/${uuid}`);
  }

  create(paiement: Partial<Paiement>): Observable<Paiement> {
    return this.api.post<Paiement>(this.endpoint, paiement);
  }

  // Spécifique au paiement en ligne (Feeda Pay)
  initiateMomo(data: { telephone: string, montant: number, dossierId: number }): Observable<any> {
    return this.api.post<any>(`${this.endpoint}/momo/initiate`, data);
  }

  // Spécifique au paiement espèces (Admin)
  recordCash(paiement: Partial<Paiement>): Observable<Paiement> {
    return this.api.post<Paiement>(`${this.endpoint}/cash`, paiement);
  }

  update(uuid: string, paiement: Partial<Paiement>): Observable<Paiement> {
    return this.api.put<Paiement>(`${this.endpoint}/${uuid}`, paiement);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
