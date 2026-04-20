import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Caisse, CaisseRequest } from '../models/caisse.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CaisseService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/caisses';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Caisse> {
    return this.api.get<Caisse>(`${this.endpoint}/${uuid}`);
  }

  create(data: CaisseRequest): Observable<Caisse> {
    return this.api.post<Caisse>(this.endpoint, data);
  }

  update(uuid: string, data: CaisseRequest): Observable<Caisse> {
    return this.api.put<Caisse>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
