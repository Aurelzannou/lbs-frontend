import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Professeur, ProfesseurRequest } from '../models/professeur.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProfesseurService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/professeurs';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Professeur> {
    return this.api.get<Professeur>(`${this.endpoint}/${uuid}`);
  }

  create(data: ProfesseurRequest): Observable<Professeur> {
    return this.api.post<Professeur>(this.endpoint, data);
  }

  update(uuid: string, data: ProfesseurRequest): Observable<Professeur> {
    return this.api.put<Professeur>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
