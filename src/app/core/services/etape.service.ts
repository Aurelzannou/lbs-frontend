import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Etape, EtapeRequest } from '../models/etape.model';

@Injectable({
  providedIn: 'root'
})
export class EtapeService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/etapes';

  getAll(): Observable<Etape[]> {
    return this.api.get<Etape[]>(this.endpoint);
  }

  getOne(uuid: string): Observable<Etape> {
    return this.api.get<Etape>(`${this.endpoint}/${uuid}`);
  }

  create(etape: EtapeRequest): Observable<Etape> {
    return this.api.post<Etape>(this.endpoint, etape);
  }

  update(uuid: string, etape: EtapeRequest): Observable<Etape> {
    return this.api.put<Etape>(`${this.endpoint}/${uuid}`, etape);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
