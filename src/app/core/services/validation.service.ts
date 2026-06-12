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

  /** Retourne tous les dossiers (admin) avec pagination et filtre. */
  getAll(page = 1, size = 10, filter = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', (page - 1).toString())
      .set('size', size.toString());
    if (filter) params = params.set('filter', filter);
    return this.api.get<any>('/api/dossier-eleves', params);
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
