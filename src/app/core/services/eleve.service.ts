import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Eleve } from '../models/eleve.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EleveService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private readonly endpoint = '/api/eleves';

  getAll(
    page: number = 1,
    size: number = 10,
    filter: string = '',
    tuteurId: number | null = null,
    classeId: number | null = null,
    anneeScolaireId: number | null = null
  ): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());

    if (filter && filter.trim().length > 0) {
      params = params.set('filter', filter.trim());
    }

    if (tuteurId !== null) {
      params = params.set('tuteurId', tuteurId.toString());
    }

    if (classeId !== null) {
      params = params.set('classeId', classeId.toString());
    }

    if (anneeScolaireId !== null) {
      params = params.set('anneeScolaireId', anneeScolaireId.toString());
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

  /** Liste PDF (imprimable) de tous les élèves d'une classe. */
  telechargerListeClassePdf(classeId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${this.endpoint}/classe/${classeId}/liste-pdf`, {
      responseType: 'blob'
    });
  }
}
