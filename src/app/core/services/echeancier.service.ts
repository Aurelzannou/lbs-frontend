import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Echeancier, EcheancierRequest } from '../models/echeancier.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EcheancierService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/echeanciers';

  listerParFraisScolaire(fraisScolaireId: number): Observable<Echeancier[]> {
    const params = new HttpParams().set('fraisScolaireId', fraisScolaireId.toString());
    return this.api.get<Echeancier[]>(this.endpoint, params);
  }

  create(data: EcheancierRequest): Observable<Echeancier> {
    return this.api.post<Echeancier>(this.endpoint, data);
  }

  update(uuid: string, data: EcheancierRequest): Observable<Echeancier> {
    return this.api.put<Echeancier>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
