import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TypeOperation, TypeOperationRequest } from '../models/type-operation.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TypeOperationService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/types-operations';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<TypeOperation> {
    return this.api.get<TypeOperation>(`${this.endpoint}/${uuid}`);
  }

  create(data: TypeOperationRequest): Observable<TypeOperation> {
    return this.api.post<TypeOperation>(this.endpoint, data);
  }

  update(uuid: string, data: TypeOperationRequest): Observable<TypeOperation> {
    return this.api.put<TypeOperation>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
