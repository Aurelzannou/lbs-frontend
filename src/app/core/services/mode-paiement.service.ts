import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ModePaiement, ModePaiementRequest } from '../models/mode-paiement.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ModePaiementService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/modes-paiements';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<ModePaiement> {
    return this.api.get<ModePaiement>(`${this.endpoint}/${uuid}`);
  }

  create(data: ModePaiementRequest): Observable<ModePaiement> {
    return this.api.post<ModePaiement>(this.endpoint, data);
  }

  update(uuid: string, data: ModePaiementRequest): Observable<ModePaiement> {
    return this.api.put<ModePaiement>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
