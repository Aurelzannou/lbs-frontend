import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Niveau, NiveauRequest } from '../models/niveau.model';

@Injectable({
  providedIn: 'root'
})
export class NiveauService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/niveaux';

  getAll(): Observable<Niveau[]> {
    return this.api.get<Niveau[]>(this.endpoint);
  }

  getOne(uuid: string): Observable<Niveau> {
    return this.api.get<Niveau>(`${this.endpoint}/${uuid}`);
  }

  create(niveau: NiveauRequest): Observable<Niveau> {
    return this.api.post<Niveau>(this.endpoint, niveau);
  }

  update(uuid: string, niveau: NiveauRequest): Observable<Niveau> {
    return this.api.put<Niveau>(`${this.endpoint}/${uuid}`, niveau);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
