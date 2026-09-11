import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { EleveTuteur, EleveTuteurRequest } from '../models/eleve-tuteur.model';

@Injectable({ providedIn: 'root' })
export class EleveTuteurService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/eleve-tuteurs';

  listerParEleve(eleveId: number): Observable<EleveTuteur[]> {
    const params = new HttpParams().set('eleveId', eleveId.toString());
    return this.api.get<EleveTuteur[]>(this.endpoint, params);
  }

  listerParTuteur(tuteurId: number): Observable<EleveTuteur[]> {
    const params = new HttpParams().set('tuteurId', tuteurId.toString());
    return this.api.get<EleveTuteur[]>(this.endpoint, params);
  }

  associer(payload: EleveTuteurRequest): Observable<EleveTuteur> {
    return this.api.post<EleveTuteur>(this.endpoint, payload);
  }

  update(uuid: string, payload: EleveTuteurRequest): Observable<EleveTuteur> {
    return this.api.put<EleveTuteur>(`${this.endpoint}/${uuid}`, payload);
  }

  dissocier(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
