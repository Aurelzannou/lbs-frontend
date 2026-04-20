import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Profil {
  id: number;
  uuid: string;
  code: string;
  libelle: string;
}

export interface ProfilRequest {
  code: string;
  libelle: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfilService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/administration/profils';

  getAll(page: number = 1, size: number = 10, filter: string = ''): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(id: number): Observable<Profil> {
    return this.api.get<Profil>(`${this.endpoint}/${id}`);
  }

  create(profil: ProfilRequest): Observable<Profil> {
    return this.api.post<Profil>(this.endpoint, profil);
  }

  update(id: number, profil: ProfilRequest): Observable<Profil> {
    return this.api.put<Profil>(`${this.endpoint}/${id}`, profil);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`);
  }
}
