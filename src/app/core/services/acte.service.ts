import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Acte, ActeRequest } from '../models/acte.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ActeService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/actes';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Acte> {
    return this.api.get<Acte>(`${this.endpoint}/${uuid}`);
  }

  create(data: ActeRequest): Observable<Acte> {
    return this.api.post<Acte>(this.endpoint, data);
  }

  update(uuid: string, data: ActeRequest): Observable<Acte> {
    return this.api.put<Acte>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
