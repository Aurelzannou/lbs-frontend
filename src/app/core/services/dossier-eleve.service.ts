import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DossierEleve } from '../models/dossier-eleve.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DossierEleveService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/dossier-eleves';

  getAll(page: number = 1, size: number = 10, filter: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString());
    
    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }

    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<DossierEleve> {
    return this.api.get<DossierEleve>(`${this.endpoint}/${uuid}`);
  }

  create(dossier: Partial<DossierEleve>): Observable<DossierEleve> {
    return this.api.post<DossierEleve>(this.endpoint, dossier);
  }

  update(uuid: string, dossier: Partial<DossierEleve>): Observable<DossierEleve> {
    return this.api.put<DossierEleve>(`${this.endpoint}/${uuid}`, dossier);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
