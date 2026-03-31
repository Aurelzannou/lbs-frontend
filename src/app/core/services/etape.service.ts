import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Etape, EtapeRequest } from '../models/etape.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EtapeService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/etapes';

  getAll(page: number = 0, size: number = 25): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.api.get<any>(this.endpoint, params);
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
