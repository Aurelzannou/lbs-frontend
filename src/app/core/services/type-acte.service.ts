import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TypeActe, TypeActeRequest } from '../models/type-acte.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TypeActeService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/types-actes';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<TypeActe> {
    return this.api.get<TypeActe>(`${this.endpoint}/${uuid}`);
  }

  create(data: TypeActeRequest): Observable<TypeActe> {
    return this.api.post<TypeActe>(this.endpoint, data);
  }

  update(uuid: string, data: TypeActeRequest): Observable<TypeActe> {
    return this.api.put<TypeActe>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
