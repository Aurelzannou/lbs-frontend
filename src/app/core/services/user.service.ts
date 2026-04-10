import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  uuid: string;
  nom: string;
  prenom: string;
  login: string;
  photo?: string;
  sexe?: string;
  keycloack: string;
  profils?: string[]; // On rajoutera le chargement des profils si besoin
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/api/administration/utilisateurs`;

  constructor(private http: HttpClient) {}

  getAll(page: number = 1, size: number = 10, filter: string = ''): Observable<any> {
    const params = `?page=${page}&size=${size}&filter=${filter}`;
    return this.http.get<any>(`${this.apiUrl}${params}`);
  }

  updateProfils(userId: number, profilCodes: string[]): Observable<void> {
    return this.http.post<any>(`${this.apiUrl}/${userId}/profils`, profilCodes).pipe(
      map(response => response.data)
    );
  }
}
