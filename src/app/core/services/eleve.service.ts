import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Eleve } from '../models/eleve.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EleveService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/eleves';

  getAll(page: number = 1, size: number = 10, filter: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }

    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Eleve> {
    return this.api.get<Eleve>(`${this.endpoint}/${uuid}`);
  }

  create(eleve: Partial<Eleve>): Observable<Eleve> {
    return this.api.post<Eleve>(this.endpoint, eleve);
  }

  update(uuid: string, eleve: Partial<Eleve>): Observable<Eleve> {
    return this.api.put<Eleve>(`${this.endpoint}/${uuid}`, eleve);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
