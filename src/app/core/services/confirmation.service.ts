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

  /** Retourne les dossiers filtrés par statut (ACCEPTE ou INSCRIT). */
  getDossiers(statut?: string, page = 0, size = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (statut) params = params.set('statut', statut);
    return this.api.get<any>('/api/validation/dossiers', params);
  }

  /** Confirme l'inscription d'un dossier (passage au statut INSCRIT). */
  inscrire(uuid: string): Observable<any> {
    return this.api.put<any>(`/api/validation/dossiers/${uuid}/inscrire`, {});
  }
}
