import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { Bulletin, BulletinMentionRequest } from '../models/bulletin.model';

@Injectable({
  providedIn: 'root'
})
export class BulletinService {
  private api = inject(ApiService);
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  private readonly endpoint = '/api/bulletins';

  genererEleve(eleveId: number, periodeId: number): Observable<Bulletin> {
    const params = new HttpParams().set('periodeId', periodeId.toString());
    return this.api.get<Bulletin>(`${this.endpoint}/eleve/${eleveId}`, params);
  }

  genererClasse(classeId: number, periodeId: number): Observable<Bulletin[]> {
    const params = new HttpParams().set('periodeId', periodeId.toString());
    return this.api.get<Bulletin[]>(`${this.endpoint}/classe/${classeId}`, params);
  }

  enregistrerMentions(eleveId: number, periodeId: number, payload: BulletinMentionRequest): Observable<Bulletin> {
    return this.api.put<Bulletin>(`${this.endpoint}/mentions/${eleveId}/${periodeId}`, payload);
  }

  getMesEnfantsBulletin(eleveId: number, periodeId: number): Observable<Bulletin> {
    const params = new HttpParams().set('periodeId', periodeId.toString());
    return this.api.get<Bulletin>(`${this.endpoint}/mes-enfants/${eleveId}`, params);
  }

  telechargerPdfEleve(eleveId: number, periodeId: number): Observable<Blob> {
    const params = new HttpParams().set('periodeId', periodeId.toString());
    return this.http.get(`${this.baseUrl}${this.endpoint}/eleve/${eleveId}/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  telechargerPdfClasse(classeId: number, periodeId: number): Observable<Blob> {
    const params = new HttpParams().set('periodeId', periodeId.toString());
    return this.http.get(`${this.baseUrl}${this.endpoint}/classe/${classeId}/pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
