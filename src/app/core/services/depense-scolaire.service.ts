import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DepenseScolaire, DepenseScolaireRequest } from '../models/depense-scolaire.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DepenseScolaireService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/depenses-scolaires';

  getAll(page: number = 1, size: number = 10, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', (page - 1).toString()).set('size', size.toString());
    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }
    return this.api.get<any>(this.endpoint, params);
  }

  create(data: DepenseScolaireRequest): Observable<DepenseScolaire> {
    return this.api.post<DepenseScolaire>(this.endpoint, data);
  }

  annuler(uuid: string): Observable<DepenseScolaire> {
    return this.api.put<DepenseScolaire>(`${this.endpoint}/${uuid}/annuler`, {});
  }
}
