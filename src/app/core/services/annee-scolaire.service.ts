import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { AnneeScolaire, AnneeScolaireRequest } from '../models/annee-scolaire.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AnneeScolaireService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/annees-scolaires';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<AnneeScolaire> {
    return this.api.get<AnneeScolaire>(`${this.endpoint}/${uuid}`);
  }

  create(data: AnneeScolaireRequest): Observable<AnneeScolaire> {
    return this.api.post<AnneeScolaire>(this.endpoint, data);
  }

  update(uuid: string, data: AnneeScolaireRequest): Observable<AnneeScolaire> {
    return this.api.put<AnneeScolaire>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
