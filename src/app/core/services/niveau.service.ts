import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Niveau, NiveauRequest } from '../models/niveau.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class NiveauService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/niveaux';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Niveau> {
    return this.api.get<Niveau>(`${this.endpoint}/${uuid}`);
  }

  create(niveau: NiveauRequest): Observable<Niveau> {
    return this.api.post<Niveau>(this.endpoint, niveau);
  }

  update(uuid: string, niveau: NiveauRequest): Observable<Niveau> {
    return this.api.put<Niveau>(`${this.endpoint}/${uuid}`, niveau);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
