import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Classe, ClasseRequest } from '../models/classe.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClasseService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/classes';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Classe> {
    return this.api.get<Classe>(`${this.endpoint}/${uuid}`);
  }

  create(data: ClasseRequest): Observable<Classe> {
    return this.api.post<Classe>(this.endpoint, data);
  }

  update(uuid: string, data: ClasseRequest): Observable<Classe> {
    return this.api.put<Classe>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
