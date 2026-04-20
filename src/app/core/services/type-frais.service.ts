import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TypeFrais, TypeFraisRequest } from '../models/type-frais.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TypeFraisService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/types-frais';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<TypeFrais> {
    return this.api.get<TypeFrais>(`${this.endpoint}/${uuid}`);
  }

  create(data: TypeFraisRequest): Observable<TypeFrais> {
    return this.api.post<TypeFrais>(this.endpoint, data);
  }

  update(uuid: string, data: TypeFraisRequest): Observable<TypeFrais> {
    return this.api.put<TypeFrais>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
