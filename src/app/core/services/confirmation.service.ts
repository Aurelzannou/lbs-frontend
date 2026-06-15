import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';

/**
 * Service dédié à l'écran de confirmation d'inscription.
 * Gère la liste (ACCEPTE / INSCRIT) et l'action inscrire.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  private api = inject(ApiService);

  /** Retourne les dossiers filtrés par statut, année et recherche texte. */
  getDossiers(statut?: string, anneeId?: number | null, filter?: string): Observable<any> {
    let params = new HttpParams();
    if (statut)  params = params.set('statut', statut);
    if (anneeId) params = params.set('anneeId', anneeId.toString());
    if (filter?.trim()) params = params.set('filter', filter.trim());
    return this.api.get<any>('/api/validation/dossiers', params);
  }

  /** Confirme l'inscription d'un dossier (passage au statut INSCRIT). */
  inscrire(uuid: string): Observable<any> {
    return this.api.put<any>(`/api/validation/dossiers/${uuid}/inscrire`, {});
  }
}
