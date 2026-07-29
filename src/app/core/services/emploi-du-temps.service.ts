import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EmploiDuTemps, EmploiDuTempsRequest } from '../models/emploi-du-temps.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EmploiDuTempsService {
  private api = inject(ApiService);
  private readonly endpoint = '/api/emploi-du-temps';

  /** Retourne le planning hebdomadaire d'une classe pour une année scolaire donnée. */
  getByClasse(classeId: number, anneeScolaireId: number): Observable<any> {
    const params = new HttpParams()
      .set('classeId', classeId.toString())
      .set('anneeScolaireId', anneeScolaireId.toString());
    return this.api.get<any>(this.endpoint, params);
  }

  create(data: EmploiDuTempsRequest): Observable<EmploiDuTemps> {
    return this.api.post<EmploiDuTemps>(this.endpoint, data);
  }

  update(uuid: string, data: EmploiDuTempsRequest): Observable<EmploiDuTemps> {
    return this.api.put<EmploiDuTemps>(`${this.endpoint}/${uuid}`, data);
  }

  delete(uuid: string): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${uuid}`);
  }

  /**
   * Réorganise en une seule requête tous les cours d'un jour (glisser-déposer) — évite les
   * faux conflits transitoires qu'on aurait avec des appels de mise à jour indépendants.
   */
  reorganiserJour(
    jour: string,
    seances: { uuid: string; heureDebut: string; heureFin: string }[]
  ): Observable<any> {
    return this.api.put<any>(`${this.endpoint}/reorganiser-jour`, { jour, seances });
  }

  /** Nombre de cours actuellement attribués à ce professeur (toutes classes/années confondues). */
  countCoursParProf(profId: number): Observable<any> {
    const params = new HttpParams().set('profId', profId.toString());
    return this.api.get<any>(`${this.endpoint}/count-prof`, params);
  }
}
