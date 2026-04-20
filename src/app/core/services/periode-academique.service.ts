import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PeriodeAcademique, PeriodeAcademiqueRequest } from '../models/periode-academique.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PeriodeAcademiqueService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/periodes-academiques';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<PeriodeAcademique> {
    return this.api.get<PeriodeAcademique>(`${this.endpoint}/${uuid}`);
  }

  create(data: PeriodeAcademiqueRequest): Observable<PeriodeAcademique> {
    return this.api.post<PeriodeAcademique>(this.endpoint, data);
  }

  update(uuid: string, data: PeriodeAcademiqueRequest): Observable<PeriodeAcademique> {
    return this.api.put<PeriodeAcademique>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
