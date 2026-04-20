import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { CategorieDepense, CategorieDepenseRequest } from '../models/categorie-depense.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CategorieDepenseService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/categories-depenses';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<CategorieDepense> {
    return this.api.get<CategorieDepense>(`${this.endpoint}/${uuid}`);
  }

  create(data: CategorieDepenseRequest): Observable<CategorieDepense> {
    return this.api.post<CategorieDepense>(this.endpoint, data);
  }

  update(uuid: string, data: CategorieDepenseRequest): Observable<CategorieDepense> {
    return this.api.put<CategorieDepense>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
