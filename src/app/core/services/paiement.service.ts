import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Paiement, PaiementRequest } from '../models/paiement.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private readonly endpoint = '/api/paiements';

  getAll(
    page: number = 1,
    size: number = 10,
    filter: string = '',
    anneeScolaireId: number | null = null
  ): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }
    if (anneeScolaireId !== null) {
      params = params.set('anneeScolaireId', anneeScolaireId.toString());
    }
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Paiement> {
    return this.api.get<Paiement>(`${this.endpoint}/${uuid}`);
  }

  create(paiement: PaiementRequest): Observable<Paiement> {
    return this.api.post<Paiement>(this.endpoint, paiement);
  }

  annuler(uuid: string): Observable<Paiement> {
    return this.api.put<Paiement>(`${this.endpoint}/${uuid}/annuler`, {});
  }

  getRecuPdf(uuid: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.endpoint}/${uuid}/recu-pdf`, {
      responseType: 'blob'
    });
  }
}
