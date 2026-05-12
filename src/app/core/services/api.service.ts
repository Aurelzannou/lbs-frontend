import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  path: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${path}`, { params }).pipe(
      map(response => response.data)
    );
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(
      map(response => response.data)
    );
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(
      map(response => response.data)
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${path}`).pipe(
      map(response => response.data)
    );
  }

  patch<T>(path: string, body: any): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${path}`, body).pipe(
      map(response => response.data)
    );
  }
}
