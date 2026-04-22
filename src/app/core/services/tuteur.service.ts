import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Tuteur } from '../models/tuteur.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TuteurService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/tuteurs';

  getAll(page: number = 1, size: number = 10, filter: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString());
    
    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }

    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Tuteur> {
    return this.api.get<Tuteur>(`${this.endpoint}/${uuid}`);
  }

  create(tuteur: Partial<Tuteur>): Observable<Tuteur> {
    return this.api.post<Tuteur>(this.endpoint, tuteur);
  }

  update(uuid: string, tuteur: Partial<Tuteur>): Observable<Tuteur> {
    return this.api.put<Tuteur>(`${this.endpoint}/${uuid}`, tuteur);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
