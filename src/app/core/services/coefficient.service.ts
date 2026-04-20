import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Coefficient, CoefficientRequest } from '../models/coefficient.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CoefficientService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/coefficients';

  getAll(page: number = 0, size: number = 25, filter: string = ''): Observable<any> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>(this.endpoint, params);
  }

  getOne(uuid: string): Observable<Coefficient> {
    return this.api.get<Coefficient>(`${this.endpoint}/${uuid}`);
  }

  create(data: CoefficientRequest): Observable<Coefficient> {
    return this.api.post<Coefficient>(this.endpoint, data);
  }

  update(uuid: string, data: CoefficientRequest): Observable<Coefficient> {
    return this.api.put<Coefficient>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }
}
