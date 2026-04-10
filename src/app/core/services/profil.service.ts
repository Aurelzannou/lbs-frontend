import { Injectable, inject } from '@angular/core';
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

  getAll(): Observable<Profil[]> {
    return this.api.get<Profil[]>(this.endpoint);
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
