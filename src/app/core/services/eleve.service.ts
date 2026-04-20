import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Eleve } from '../models/eleve.model';

@Injectable({
  providedIn: 'root'
})
export class EleveService {
  private http = inject(HttpClient);
  private readonly endpoint = '/api/eleves';

  getAll(page: number = 1, size: number = 10, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<any>(this.endpoint, { params });
  }

  getOne(uuid: string): Observable<Eleve> {
    return this.http.get<Eleve>(`${this.endpoint}/${uuid}`);
  }

  create(eleve: Partial<Eleve>): Observable<Eleve> {
    return this.http.post<Eleve>(this.endpoint, eleve);
  }

  update(uuid: string, eleve: Partial<Eleve>): Observable<Eleve> {
    return this.http.put<Eleve>(`${this.endpoint}/${uuid}`, eleve);
  }

  delete(uuid: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
