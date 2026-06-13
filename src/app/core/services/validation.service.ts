import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';

/**
 * Service dédié au workflow de validation des dossiers d'inscription.
 * Utilisé côté admin (liste, accepter, refuser, inscrire)
 * et côté parent (mes dossiers).
 */
@Injectable({ providedIn: 'root' })
export class ValidationService {
  private api = inject(ApiService);

  /** Retourne les dossiers du parent connecté (JWT). */
  getMesDossiers(): Observable<any[]> {
    return this.api.get<any[]>('/api/validation/mes-dossiers');
  }

  /** Retourne les dossiers pour validation (admin), filtrables par statut. */
  getAll(statut?: string, page = 0, size = 20): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (statut) params = params.set('statut', statut);
    return this.api.get<any>('/api/validation/dossiers', params);
  }

  /** Accepte un dossier et envoie un email au parent. */
  accepter(uuid: string): Observable<any> {
    return this.api.put<any>(`/api/validation/dossiers/${uuid}/accepter`, {});
  }

  /** Refuse un dossier avec un motif optionnel et envoie un email au parent. */
  refuser(uuid: string, motif?: string): Observable<any> {
    return this.api.put<any>(`/api/validation/dossiers/${uuid}/refuser`, { motif: motif || null });
  }

  /** Marque un dossier comme inscrit (après paiement). */
  inscrire(uuid: string): Observable<any> {
    return this.api.put<any>(`/api/validation/dossiers/${uuid}/inscrire`, {});
  }

  /** Supprime un dossier. */
  supprimer(uuid: string): Observable<void> {
    return this.api.delete<void>(`/api/dossier-eleves/${uuid}`);
  }
}
